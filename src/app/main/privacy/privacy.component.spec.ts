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
import { PrivacyComponent } from './privacy.component';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { NavigationService } from '@app/services/navigation.service';

describe('PrivacyComponent', () => {
  let component: PrivacyComponent;
  let fixture: ComponentFixture<PrivacyComponent>;
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
    fixture = TestBed.createComponent(PrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const flushPrivacyFile = async (url: string, body: string): Promise<void> => {
    httpMock.expectOne(url).flush(body);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
  };

  const privacyContainer = (): HTMLElement =>
    fixture.nativeElement.querySelector('.section-style') as HTMLElement;

  beforeEach(async () => {
    urlLanguage$ = new BehaviorSubject(DEFAULT_LOCALE);
    navigationServiceSpy = {
      urlLanguage$: urlLanguage$,
      navigate: vi.fn().mockName('navigate'),
      scrollToAnchor: vi.fn().mockName('scrollToAnchor'),
    };

    navigationServiceSpy.navigate.mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [PrivacyComponent],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: EnvService, useValue: envMock },
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock?.verify();
  });

  it('should create', async () => {
    createComponent();

    flushPrivacyFile(
      `assets/legal/privacy.${DEFAULT_LOCALE}.html`,
      '<div class="layout"><main class="content"><section id="intro">Content</section></main></div>',
    );

    expect(component).toBeTruthy();
  });

  it('should replace environment placeholders in loaded html', async () => {
    createComponent();

    flushPrivacyFile(
      `assets/legal/privacy.${DEFAULT_LOCALE}.html`,
      `
      <div class="layout">
        <main class="content">
          <section id="intro">{{TITLE}} | {{APP_DOMAIN}} | {{APP_URL}} | {{LANGUAGE}}</section>
        </main>
      </div>
      `,
    );

    const html = privacyContainer().innerHTML;
    expect(html).toContain('Nails Cleos DEV');
    expect(html).toContain('www.nailscleos.test');
    expect(html).toContain('https://www.nailscleos.test');
    expect(html).toContain(DEFAULT_LOCALE);
  });

  it('should load spanish legal file for /es route and not fallback when present', async () => {
    urlLanguage$.next('es');
    createComponent();

    flushPrivacyFile(
      'assets/legal/privacy.es.html',
      '<div class="layout"><main class="content"><section id="intro">Contenido {{LANGUAGE}}</section></main></div>',
    );

    expect(privacyContainer().innerHTML).toContain('Contenido es');
    httpMock.expectNone(`assets/legal/privacy.${DEFAULT_LOCALE}.html`);
  });

  it('should fallback to english legal file when locale file is missing', async () => {
    urlLanguage$.next('es');
    createComponent();

    httpMock.expectOne('assets/legal/privacy.es.html').flush('', {
      status: 404,
      statusText: 'Not Found',
    });
    flushPrivacyFile(
      `assets/legal/privacy.${DEFAULT_LOCALE}.html`,
      '<div class="layout"><main class="content"><section id="intro">Fallback {{LANGUAGE}}</section></main></div>',
    );

    expect(privacyContainer().innerHTML).toContain('Fallback es');
  });

  it('should route to same privacy page fragment when clicking in-page anchor', async () => {
    createComponent();

    flushPrivacyFile(
      `assets/legal/privacy.${DEFAULT_LOCALE}.html`,
      `
      <div class="layout">
        <aside class="sidebar"><nav><a id="go-rights" href="#rights">Rights</a></nav></aside>
        <main class="content"><section id="rights">Rights section</section></main>
      </div>
      `,
    );

    navigationServiceSpy.navigate.mockClear();
    navigationServiceSpy.scrollToAnchor.mockClear();
    (
      fixture.nativeElement.querySelector('#go-rights') as HTMLAnchorElement
    ).dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }),
    );
    await Promise.resolve();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(
      ['home', 'privacy'],
      { fragment: 'rights', replaceUrl: true },
      expect.any(Function),
    );
    const callback = vi.mocked(navigationServiceSpy.navigate).mock
      .lastCall?.[2] as () => void;

    callback();

    expect(navigationServiceSpy.scrollToAnchor).toHaveBeenCalledTimes(1);

    expect(navigationServiceSpy.scrollToAnchor).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      'rights',
    );
  });

  it('should ignore unsafe javascript links in dynamic html', async () => {
    createComponent();

    flushPrivacyFile(
      `assets/legal/privacy.${DEFAULT_LOCALE}.html`,
      `
      <div class="layout">
        <aside class="sidebar"><nav><a id="unsafe-link" href="javascript:void(0)">Unsafe</a></nav></aside>
        <main class="content"><section id="rights">Rights section</section></main>
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

  it('should decode URL-encoded anchor ids before navigating', async () => {
    createComponent();

    flushPrivacyFile(
      `assets/legal/privacy.${DEFAULT_LOCALE}.html`,
      `
      <div class="layout">
        <aside class="sidebar">
          <nav><a id="encoded-anchor" href="#your%20rights">Encoded</a></nav>
        </aside>
        <main class="content"><section id="your rights">Rights section</section></main>
      </div>
      `,
    );

    navigationServiceSpy.navigate.mockClear();
    (
      fixture.nativeElement.querySelector(
        '#encoded-anchor',
      ) as HTMLAnchorElement
    ).dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }),
    );
    await Promise.resolve();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(
      ['home', 'privacy'],
      { fragment: 'your rights', replaceUrl: true },
      expect.any(Function),
    );
  });

  it('should ignore empty hash anchors', async () => {
    createComponent();

    flushPrivacyFile(
      `assets/legal/privacy.${DEFAULT_LOCALE}.html`,
      `
      <div class="layout">
        <aside class="sidebar"><nav><a id="empty-anchor" href="#">Empty</a></nav></aside>
        <main class="content"><section id="rights">Rights section</section></main>
      </div>
      `,
    );

    navigationServiceSpy.navigate.mockClear();
    (
      fixture.nativeElement.querySelector('#empty-anchor') as HTMLAnchorElement
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

    flushPrivacyFile(
      `assets/legal/privacy.${DEFAULT_LOCALE}.html`,
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

    flushPrivacyFile(
      `assets/legal/privacy.${DEFAULT_LOCALE}.html`,
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
