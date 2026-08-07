import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
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
    navigate: jasmine.Spy;
    scrollToAnchor: jasmine.Spy;
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

  const flushTermsFile = (url: string, body: string): void => {
    httpMock.expectOne(url).flush(body);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    urlLanguage$ = new BehaviorSubject(DEFAULT_LOCALE);
    navigationServiceSpy = {
      urlLanguage$: urlLanguage$,
      navigate: jasmine.createSpy('navigate'),
      scrollToAnchor: jasmine.createSpy('scrollToAnchor'),
    };

    navigationServiceSpy.navigate.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [TermsAndConditionsComponent],
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

  it('should create and configure meta tags', fakeAsync(() => {
    createComponent();

    flushTermsFile(
      `assets/legal/terms.${ DEFAULT_LOCALE }.html`,
      '<div class="layout"><main class="content"><section id="general">General</section></main></div>',
    );

    expect(component).toBeTruthy();
  }));

  it('should load spanish terms file for /es route', fakeAsync(() => {
    urlLanguage$.next('es');
    createComponent();

    flushTermsFile(
      'assets/legal/terms.es.html',
      '<div class="layout"><main class="content"><section id="general">Contenido {{LANGUAGE}}</section></main></div>',
    );

    expect(termsContainer().innerHTML).toContain('Contenido es');
    httpMock.expectNone(`assets/legal/terms.${DEFAULT_LOCALE}.html`);
  }));

  it('should fallback to english terms file when locale file is missing', fakeAsync(() => {
    urlLanguage$.next('es');
    createComponent();

    httpMock.expectOne('assets/legal/terms.es.html').flush('', {
      status: 404,
      statusText: 'Not Found',
    });
    flushTermsFile(
      `assets/legal/terms.${ DEFAULT_LOCALE }.html`,
      '<div class="layout"><main class="content"><section id="general">Fallback {{LANGUAGE}}</section></main></div>',
    );

    expect(termsContainer().innerHTML).toContain('Fallback es');
  }));

  it('should navigate to in-page fragment when clicking sidebar anchors', fakeAsync(() => {
    createComponent();

    flushTermsFile(
      `assets/legal/terms.${ DEFAULT_LOCALE }.html`,
      `
      <div class="layout">
        <aside class="sidebar"><nav><a id="go-general" href="#general">General</a></nav></aside>
        <main class="content"><section id="general">General section</section></main>
      </div>
      `,
    );

    navigationServiceSpy.navigate.calls.reset();
    navigationServiceSpy.scrollToAnchor.calls.reset();
    (fixture.nativeElement.querySelector('#go-general') as HTMLAnchorElement).dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }));
    tick();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(
      ['home', 'term-and-conditions'],
      { fragment: 'general', replaceUrl: true },
      jasmine.any(Function),
    );
    const callback =
      navigationServiceSpy.navigate.calls.mostRecent().args[2] as () => void;

    callback();

    expect(navigationServiceSpy.scrollToAnchor).toHaveBeenCalledOnceWith(jasmine.any(HTMLElement), 'general');
  }));

  it('should ignore unsafe javascript links in content', fakeAsync(() => {
    createComponent();

    flushTermsFile(
      `assets/legal/terms.${ DEFAULT_LOCALE }.html`,
      `
      <div class="layout">
        <aside class="sidebar"><nav><a id="unsafe-link" href="javascript:void(0)">Unsafe</a></nav></aside>
        <main class="content"><section id="general">General section</section></main>
      </div>
      `,
    );

    navigationServiceSpy.navigate.calls.reset();
    (fixture.nativeElement.querySelector('#unsafe-link') as HTMLAnchorElement).dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }));
    tick();

    expect(navigationServiceSpy.navigate).not.toHaveBeenCalled();
  }));

  it('should ignore mailto links in dynamic html', fakeAsync(() => {
    createComponent();

    flushTermsFile(
      `assets/legal/terms.${ DEFAULT_LOCALE }.html`,
      `
    <div class="layout">
      <aside class="sidebar">
        <nav><a id="mailto-link" href="mailto:test@nailscleos.test">Mail</a></nav>
      </aside>
      <main class="content"></main>
    </div>
    `,
    );

    navigationServiceSpy.navigate.calls.reset();

    const link = fixture.nativeElement.querySelector('#mailto-link') as HTMLAnchorElement;

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'target', { value: link });

    component.onHostClick(event);

    tick();

    expect(navigationServiceSpy.navigate).not.toHaveBeenCalled();
  }));

  it('should ignore external http links', fakeAsync(() => {
    createComponent();

    flushTermsFile(
      `assets/legal/terms.${ DEFAULT_LOCALE }.html`,
      `
    <div class="layout">
      <aside class="sidebar">
        <nav><a id="external-link" href="https://google.com">External</a></nav>
      </aside>
      <main class="content"></main>
    </div>
    `,
    );

    navigationServiceSpy.navigate.calls.reset();

    const link = fixture.nativeElement.querySelector('#external-link') as HTMLAnchorElement;

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'target', { value: link });

    component.onHostClick(event);

    tick();

    expect(navigationServiceSpy.navigate).not.toHaveBeenCalled();
  }));
});
