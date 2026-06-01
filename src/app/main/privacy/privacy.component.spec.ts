import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { EnvService } from '../../services/env.service';
import { PrivacyComponent } from './privacy.component';

describe('PrivacyComponent', () => {
  let component: PrivacyComponent;
  let fixture: ComponentFixture<PrivacyComponent>;
  let httpMock: HttpTestingController;
  let routerEvents: Subject<unknown>;
  let routerMock: {
    events: Subject<unknown>;
    url: string;
    navigate: jasmine.Spy;
    parseUrl: jasmine.Spy;
  };

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
    routerEvents = new Subject<unknown>();

    routerMock = {
      events: routerEvents,
      url: '/en-GB/home/privacy',
      navigate: jasmine.createSpy('navigate').and.resolveTo(true),
      parseUrl: jasmine.createSpy('parseUrl').and.callFake((url: string) => {
        const hashIndex = url.indexOf('#');
        return { fragment: hashIndex >= 0 ? decodeURIComponent(url.substring(hashIndex + 1)) : null };
      }),
    };

    await TestBed.configureTestingModule({
      imports: [PrivacyComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerMock },
        { provide: EnvService, useValue: envMock },
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
      'assets/legal/privacy.en-GB.html',
      '<div class="layout"><main class="content"><section id="intro">Content</section></main></div>',
    );

    expect(component).toBeTruthy();
  }));

  it('should replace environment placeholders in loaded html', fakeAsync(() => {
    createComponent();

    flushPrivacyFile(
      'assets/legal/privacy.en-GB.html',
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
    expect(html).toContain('en-GB');
  }));

  it('should load spanish legal file for /es route and not fallback when present', fakeAsync(() => {
    routerMock.url = '/es/home/privacy';
    createComponent();

    flushPrivacyFile(
      'assets/legal/privacy.es.html',
      '<div class="layout"><main class="content"><section id="intro">Contenido {{LANGUAGE}}</section></main></div>',
    );

    expect(privacyContainer().innerHTML).toContain('Contenido es');
    httpMock.expectNone('assets/legal/privacy.en-GB.html');
  }));

  it('should fallback to english legal file when locale file is missing', fakeAsync(() => {
    routerMock.url = '/es/home/privacy';
    createComponent();

    httpMock.expectOne('assets/legal/privacy.es.html').flush('', {
      status: 404,
      statusText: 'Not Found',
    });
    flushPrivacyFile(
      'assets/legal/privacy.en-GB.html',
      '<div class="layout"><main class="content"><section id="intro">Fallback {{LANGUAGE}}</section></main></div>',
    );

    expect(privacyContainer().innerHTML).toContain('Fallback es');
  }));

  it('should route to same privacy page fragment when clicking in-page anchor', fakeAsync(() => {
    const scrollSpy = spyOn(Element.prototype as unknown as { scrollIntoView: () => void }, 'scrollIntoView');
    createComponent();

    flushPrivacyFile(
      'assets/legal/privacy.en-GB.html',
      `
      <div class="layout">
        <aside class="sidebar"><nav><a id="go-rights" href="#rights">Rights</a></nav></aside>
        <main class="content"><section id="rights">Rights section</section></main>
      </div>
      `,
    );

    routerMock.navigate.calls.reset();
    (fixture.nativeElement.querySelector('#go-rights') as HTMLAnchorElement).dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }));
    tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/', 'en-GB', 'home', 'privacy'],
      { fragment: 'rights', replaceUrl: true },
    );
    expect(scrollSpy).toHaveBeenCalled();
  }));

  it('should ignore unsafe javascript links in dynamic html', fakeAsync(() => {
    createComponent();

    flushPrivacyFile(
      'assets/legal/privacy.en-GB.html',
      `
      <div class="layout">
        <aside class="sidebar"><nav><a id="unsafe-link" href="javascript:void(0)">Unsafe</a></nav></aside>
        <main class="content"><section id="rights">Rights section</section></main>
      </div>
      `,
    );

    routerMock.navigate.calls.reset();
    (fixture.nativeElement.querySelector('#unsafe-link') as HTMLAnchorElement).dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }));
    tick();

    expect(routerMock.navigate).not.toHaveBeenCalled();
  }));

  it('should scroll to URL fragment after dynamic html render', fakeAsync(() => {
    routerMock.url = '/en-GB/home/privacy#rights';
    const scrollSpy = spyOn(Element.prototype as unknown as { scrollIntoView: () => void }, 'scrollIntoView');
    createComponent();

    flushPrivacyFile(
      'assets/legal/privacy.en-GB.html',
      '<div class="layout"><main class="content"><section id="rights">Rights section</section></main></div>',
    );

    tick(1);

    expect(scrollSpy).toHaveBeenCalled();
    expect(routerMock.parseUrl).toHaveBeenCalledWith('/en-GB/home/privacy#rights');
  }));

  it('should decode URL-encoded anchor ids before navigating', fakeAsync(() => {
    createComponent();

    flushPrivacyFile(
      'assets/legal/privacy.en-GB.html',
      `
      <div class="layout">
        <aside class="sidebar">
          <nav><a id="encoded-anchor" href="#your%20rights">Encoded</a></nav>
        </aside>
        <main class="content"><section id="your rights">Rights section</section></main>
      </div>
      `,
    );

    routerMock.navigate.calls.reset();
    (fixture.nativeElement.querySelector('#encoded-anchor') as HTMLAnchorElement).dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }));
    tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/', 'en-GB', 'home', 'privacy'],
      { fragment: 'your rights', replaceUrl: true },
    );
  }));

  it('should ignore empty hash anchors', fakeAsync(() => {
    createComponent();

    flushPrivacyFile(
      'assets/legal/privacy.en-GB.html',
      `
      <div class="layout">
        <aside class="sidebar"><nav><a id="empty-anchor" href="#">Empty</a></nav></aside>
        <main class="content"><section id="rights">Rights section</section></main>
      </div>
      `,
    );

    routerMock.navigate.calls.reset();
    (fixture.nativeElement.querySelector('#empty-anchor') as HTMLAnchorElement).dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }));
    tick();

    expect(routerMock.navigate).not.toHaveBeenCalled();
  }));

  it('should ignore mailto links in dynamic html', fakeAsync(() => {
    createComponent();

    flushPrivacyFile(
      'assets/legal/privacy.en-GB.html',
      `
    <div class="layout">
      <aside class="sidebar">
        <nav><a id="mailto-link" href="mailto:test@nailscleos.test">Mail</a></nav>
      </aside>
      <main class="content"></main>
    </div>
    `,
    );

    routerMock.navigate.calls.reset();

    const link = fixture.nativeElement.querySelector('#mailto-link') as HTMLAnchorElement;

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'target', { value: link });

    component.onHostClick(event);

    tick();

    expect(routerMock.navigate).not.toHaveBeenCalled();
  }));

  it('should ignore external http links', fakeAsync(() => {
    createComponent();

    flushPrivacyFile(
      'assets/legal/privacy.en-GB.html',
      `
    <div class="layout">
      <aside class="sidebar">
        <nav><a id="external-link" href="https://google.com">External</a></nav>
      </aside>
      <main class="content"></main>
    </div>
    `,
    );

    routerMock.navigate.calls.reset();

    const link = fixture.nativeElement.querySelector('#external-link') as HTMLAnchorElement;

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'target', { value: link });

    component.onHostClick(event);

    tick();

    expect(routerMock.navigate).not.toHaveBeenCalled();
  }));
});
