import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { EnvService } from '../../services/env.service';
import { PrivacyComponent } from './privacy.component';
import { DEFAULT_LOCALE } from '../../util/dates';
import { NavigationService } from '../../services/navigation.service';

describe('PrivacyComponent', () => {
  let component: PrivacyComponent;
  let fixture: ComponentFixture<PrivacyComponent>;
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
    fixture = TestBed.createComponent(PrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const flushPrivacyFile = (url: string, body: string): void => {
    httpMock.expectOne(url).flush(body);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  };

  const privacyContainer = (): HTMLElement =>
    fixture.nativeElement.querySelector('.section-style') as HTMLElement;

  beforeEach(async () => {
    urlLanguage$ = new BehaviorSubject(DEFAULT_LOCALE);
    navigationServiceSpy = {
      urlLanguage$: urlLanguage$,
      navigate: jasmine.createSpy('navigate'),
      scrollToAnchor: jasmine.createSpy('scrollToAnchor'),
    };

    navigationServiceSpy.navigate.and.returnValue(Promise.resolve(true));

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

  it('should create', fakeAsync(() => {
    createComponent();

    flushPrivacyFile(
      `assets/legal/privacy.${ DEFAULT_LOCALE }.html`,
      '<div class="layout"><main class="content"><section id="intro">Content</section></main></div>',
    );

    expect(component).toBeTruthy();
  }));

  it('should replace environment placeholders in loaded html', fakeAsync(() => {
    createComponent();

    flushPrivacyFile(
      `assets/legal/privacy.${ DEFAULT_LOCALE }.html`,
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
  }));

  it('should load spanish legal file for /es route and not fallback when present', fakeAsync(() => {
    urlLanguage$.next('es');
    createComponent();

    flushPrivacyFile(
      'assets/legal/privacy.es.html',
      '<div class="layout"><main class="content"><section id="intro">Contenido {{LANGUAGE}}</section></main></div>',
    );

    expect(privacyContainer().innerHTML).toContain('Contenido es');
    httpMock.expectNone(`assets/legal/privacy.${ DEFAULT_LOCALE }.html`);
  }));

  it('should fallback to english legal file when locale file is missing', fakeAsync(() => {
    urlLanguage$.next('es');
    createComponent();

    httpMock.expectOne('assets/legal/privacy.es.html').flush('', {
      status: 404,
      statusText: 'Not Found',
    });
    flushPrivacyFile(
      `assets/legal/privacy.${ DEFAULT_LOCALE }.html`,
      '<div class="layout"><main class="content"><section id="intro">Fallback {{LANGUAGE}}</section></main></div>',
    );

    expect(privacyContainer().innerHTML).toContain('Fallback es');
  }));

  it('should route to same privacy page fragment when clicking in-page anchor', fakeAsync(() => {
    createComponent();

    flushPrivacyFile(
      `assets/legal/privacy.${ DEFAULT_LOCALE }.html`,
      `
      <div class="layout">
        <aside class="sidebar"><nav><a id="go-rights" href="#rights">Rights</a></nav></aside>
        <main class="content"><section id="rights">Rights section</section></main>
      </div>
      `,
    );

    navigationServiceSpy.navigate.calls.reset();
    navigationServiceSpy.scrollToAnchor.calls.reset();
    (fixture.nativeElement.querySelector('#go-rights') as HTMLAnchorElement).dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }));
    tick();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(
      ['home', 'privacy'],
      { fragment: 'rights', replaceUrl: true },
      jasmine.any(Function),
    );
    const callback =
      navigationServiceSpy.navigate.calls.mostRecent().args[2] as () => void;

    callback();

    expect(navigationServiceSpy.scrollToAnchor).toHaveBeenCalledOnceWith(jasmine.any(HTMLElement), 'rights');
  }));

  it('should ignore unsafe javascript links in dynamic html', fakeAsync(() => {
    createComponent();

    flushPrivacyFile(
      `assets/legal/privacy.${ DEFAULT_LOCALE }.html`,
      `
      <div class="layout">
        <aside class="sidebar"><nav><a id="unsafe-link" href="javascript:void(0)">Unsafe</a></nav></aside>
        <main class="content"><section id="rights">Rights section</section></main>
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

  it('should decode URL-encoded anchor ids before navigating', fakeAsync(() => {
    createComponent();

    flushPrivacyFile(
      `assets/legal/privacy.${ DEFAULT_LOCALE }.html`,
      `
      <div class="layout">
        <aside class="sidebar">
          <nav><a id="encoded-anchor" href="#your%20rights">Encoded</a></nav>
        </aside>
        <main class="content"><section id="your rights">Rights section</section></main>
      </div>
      `,
    );

    navigationServiceSpy.navigate.calls.reset();
    (fixture.nativeElement.querySelector('#encoded-anchor') as HTMLAnchorElement).dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }));
    tick();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(
      ['home', 'privacy'],
      { fragment: 'your rights', replaceUrl: true },
      jasmine.any(Function),
    );
  }));

  it('should ignore empty hash anchors', fakeAsync(() => {
    createComponent();

    flushPrivacyFile(
      `assets/legal/privacy.${ DEFAULT_LOCALE }.html`,
      `
      <div class="layout">
        <aside class="sidebar"><nav><a id="empty-anchor" href="#">Empty</a></nav></aside>
        <main class="content"><section id="rights">Rights section</section></main>
      </div>
      `,
    );

    navigationServiceSpy.navigate.calls.reset();
    (fixture.nativeElement.querySelector('#empty-anchor') as HTMLAnchorElement).dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }));
    tick();

    expect(navigationServiceSpy.navigate).not.toHaveBeenCalled();
  }));

  it('should ignore mailto links in dynamic html', fakeAsync(() => {
    createComponent();

    flushPrivacyFile(
      `assets/legal/privacy.${ DEFAULT_LOCALE }.html`,
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

    flushPrivacyFile(
      `assets/legal/privacy.${ DEFAULT_LOCALE }.html`,
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
