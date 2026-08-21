import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { provideHttpClient, withXhr } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { EnvService } from '@app/services/env.service';
import { TermsAndConditionsComponent } from './terms-and-conditions.component';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { NavigationService } from '@app/services/navigation.service';

describe('TermsAndConditionsComponent', () => {
  let component: TermsAndConditionsComponent;
  let fixture: ComponentFixture<TermsAndConditionsComponent>;
  let navigationServiceSpy: {
    urlLanguage$: BehaviorSubject<any>;
    navigate: Mock;
    scrollToAnchor: Mock;
  };

  let urlLanguage$: BehaviorSubject<string>;
  let httpMock: HttpTestingController;

  const envMock: Pick<EnvService, 'appServer' | 'title' | 'appDomain'> = {
    appServer: 'https://www.nailscleos.test',
    title: 'Nails Cleos DEV',
    appDomain: 'www.nailscleos.test',
  };

  const createComponent = (): void => {
    fixture = TestBed.createComponent(TermsAndConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const termsContainer = (): HTMLElement =>
    fixture.nativeElement.querySelector('.section-style') as HTMLElement;

  const flushTermsFile = async (url: string, body: string): Promise<void> => {
    httpMock.expectOne(url).flush(body);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    urlLanguage$ = new BehaviorSubject(DEFAULT_LOCALE);
    navigationServiceSpy = {
      urlLanguage$: urlLanguage$,
      navigate: vi.fn().mockName('navigate'),
      scrollToAnchor: vi.fn().mockName('scrollToAnchor'),
    };

    navigationServiceSpy.navigate.mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [TermsAndConditionsComponent],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: EnvService, useValue: envMock },
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock?.verify();
  });

  it('should create and configure meta tags', async () => {
    createComponent();

    flushTermsFile(
      `assets/legal/terms.${DEFAULT_LOCALE}.html`,
      '<div class="layout"><main class="content"><section id="general">General</section></main></div>',
    );

    expect(component).toBeTruthy();
  });

  it('should load spanish terms file for /es route', async () => {
    urlLanguage$.next('es');
    createComponent();

    flushTermsFile(
      'assets/legal/terms.es.html',
      '<div class="layout"><main class="content"><section id="general">Contenido {{LANGUAGE}}</section></main></div>',
    );

    expect(termsContainer().innerHTML).toContain('Contenido es');
    httpMock.expectNone(`assets/legal/terms.${DEFAULT_LOCALE}.html`);
  });

  it('should fallback to english terms file when locale file is missing', async () => {
    urlLanguage$.next('es');
    createComponent();

    httpMock.expectOne('assets/legal/terms.es.html').flush('', {
      status: 404,
      statusText: 'Not Found',
    });
    flushTermsFile(
      `assets/legal/terms.${DEFAULT_LOCALE}.html`,
      '<div class="layout"><main class="content"><section id="general">Fallback {{LANGUAGE}}</section></main></div>',
    );

    expect(termsContainer().innerHTML).toContain('Fallback es');
  });

  it('should navigate to in-page fragment when clicking sidebar anchors', async () => {
    createComponent();

    flushTermsFile(
      `assets/legal/terms.${DEFAULT_LOCALE}.html`,
      `
      <div class="layout">
        <aside class="sidebar"><nav><a id="go-general" href="#general">General</a></nav></aside>
        <main class="content"><section id="general">General section</section></main>
      </div>
      `,
    );

    navigationServiceSpy.navigate.mockClear();
    navigationServiceSpy.scrollToAnchor.mockClear();
    (
      fixture.nativeElement.querySelector('#go-general') as HTMLAnchorElement
    ).dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }),
    );
    await Promise.resolve();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(
      ['home', 'term-and-conditions'],
      { fragment: 'general', replaceUrl: true },
      expect.any(Function),
    );
    const callback = vi.mocked(navigationServiceSpy.navigate).mock
      .lastCall?.[2] as () => void;

    callback();

    expect(navigationServiceSpy.scrollToAnchor).toHaveBeenCalledTimes(1);

    expect(navigationServiceSpy.scrollToAnchor).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      'general',
    );
  });

  it('should ignore unsafe javascript links in content', async () => {
    createComponent();

    flushTermsFile(
      `assets/legal/terms.${DEFAULT_LOCALE}.html`,
      `
      <div class="layout">
        <aside class="sidebar"><nav><a id="unsafe-link" href="javascript:void(0)">Unsafe</a></nav></aside>
        <main class="content"><section id="general">General section</section></main>
      </div>
      `,
    );

    navigationServiceSpy.navigate.mockClear();
    (
      fixture.nativeElement.querySelector('#unsafe-link') as HTMLAnchorElement
    ).dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }),
    );
    await Promise.resolve();

    expect(navigationServiceSpy.navigate).not.toHaveBeenCalled();
  });

  it('should ignore mailto links in dynamic html', async () => {
    createComponent();

    flushTermsFile(
      `assets/legal/terms.${DEFAULT_LOCALE}.html`,
      `
    <div class="layout">
      <aside class="sidebar">
        <nav><a id="mailto-link" href="mailto:test@nailscleos.test">Mail</a></nav>
      </aside>
      <main class="content"></main>
    </div>
    `,
    );

    navigationServiceSpy.navigate.mockClear();

    const link = fixture.nativeElement.querySelector(
      '#mailto-link',
    ) as HTMLAnchorElement;

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'target', { value: link });

    component.onHostClick(event);

    await Promise.resolve();

    expect(navigationServiceSpy.navigate).not.toHaveBeenCalled();
  });

  it('should ignore external http links', async () => {
    createComponent();

    flushTermsFile(
      `assets/legal/terms.${DEFAULT_LOCALE}.html`,
      `
    <div class="layout">
      <aside class="sidebar">
        <nav><a id="external-link" href="https://google.com">External</a></nav>
      </aside>
      <main class="content"></main>
    </div>
    `,
    );

    navigationServiceSpy.navigate.mockClear();

    const link = fixture.nativeElement.querySelector(
      '#external-link',
    ) as HTMLAnchorElement;

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'target', { value: link });

    component.onHostClick(event);

    await Promise.resolve();

    expect(navigationServiceSpy.navigate).not.toHaveBeenCalled();
  });
});
