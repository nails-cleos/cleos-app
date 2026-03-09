import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { EnvService } from '../../services/env.service';
import { MainContentService } from '../../services/main-content.service';
import { SeoService } from '../../services/seo.service';
import { TermsAndConditionsComponent } from './terms-and-conditions.component';

describe('TermsAndConditionsComponent', () => {
  let component: TermsAndConditionsComponent;
  let fixture: ComponentFixture<TermsAndConditionsComponent>;
  let httpMock: HttpTestingController;
  let routerEvents: Subject<unknown>;
  let routerMock: {
    events: Subject<unknown>;
    url: string;
    navigate: jasmine.Spy;
    parseUrl: jasmine.Spy;
  };
  let mainContentMock: jasmine.SpyObj<MainContentService>;
  let seoServiceMock: jasmine.SpyObj<SeoService>;
  let translateMock: jasmine.SpyObj<TranslateService>;

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
    routerEvents = new Subject<unknown>();
    mainContentMock = jasmine.createSpyObj<MainContentService>('MainContentService', ['configure']);
    seoServiceMock = jasmine.createSpyObj<SeoService>('SeoService', ['setMetaDescription', 'setMetaTitle']);
    translateMock = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);

    translateMock.instant.and.callFake((key: string) => {
      if (key === 'META') {
        return { CONTENT: 'meta-content', TITLE: 'meta-title' };
      }
      return key;
    });

    routerMock = {
      events: routerEvents,
      url: '/en-GB/home/term-and-conditions',
      navigate: jasmine.createSpy('navigate').and.resolveTo(true),
      parseUrl: jasmine.createSpy('parseUrl').and.callFake((url: string) => {
        const hashIndex = url.indexOf('#');
        return { fragment: hashIndex >= 0 ? decodeURIComponent(url.substring(hashIndex + 1)) : null };
      }),
    };

    await TestBed.configureTestingModule({
      imports: [TermsAndConditionsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerMock },
        { provide: MainContentService, useValue: mainContentMock },
        { provide: SeoService, useValue: seoServiceMock },
        { provide: TranslateService, useValue: translateMock },
        { provide: EnvService, useValue: envMock },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock?.verify();
  });

  it('should create and configure page chrome + meta tags', fakeAsync(() => {
    createComponent();

    flushTermsFile(
      'assets/legal/terms.en-GB.html',
      '<div class="layout"><main class="content"><section id="general">General</section></main></div>',
    );

    expect(component).toBeTruthy();
    expect(mainContentMock.configure).toHaveBeenCalledWith(false, 'open');
    expect(seoServiceMock.setMetaDescription).toHaveBeenCalledWith('meta-content');
    expect(seoServiceMock.setMetaTitle).toHaveBeenCalledWith('meta-title');
  }));

  it('should load spanish terms file for /es route', fakeAsync(() => {
    routerMock.url = '/es/home/term-and-conditions';
    createComponent();

    flushTermsFile(
      'assets/legal/terms.es.html',
      '<div class="layout"><main class="content"><section id="general">Contenido {{LANGUAGE}}</section></main></div>',
    );

    expect(termsContainer().innerHTML).toContain('Contenido es');
    httpMock.expectNone('assets/legal/terms.en-GB.html');
  }));

  it('should fallback to english terms file when locale file is missing', fakeAsync(() => {
    routerMock.url = '/es/home/term-and-conditions';
    createComponent();

    httpMock.expectOne('assets/legal/terms.es.html').flush('', {
      status: 404,
      statusText: 'Not Found',
    });
    flushTermsFile(
      'assets/legal/terms.en-GB.html',
      '<div class="layout"><main class="content"><section id="general">Fallback {{LANGUAGE}}</section></main></div>',
    );

    expect(termsContainer().innerHTML).toContain('Fallback es');
  }));

  it('should navigate to in-page fragment when clicking sidebar anchors', fakeAsync(() => {
    const scrollSpy = spyOn(Element.prototype as unknown as { scrollIntoView: () => void }, 'scrollIntoView');
    createComponent();

    flushTermsFile(
      'assets/legal/terms.en-GB.html',
      `
      <div class="layout">
        <aside class="sidebar"><nav><a id="go-general" href="#general">General</a></nav></aside>
        <main class="content"><section id="general">General section</section></main>
      </div>
      `,
    );

    routerMock.navigate.calls.reset();
    (fixture.nativeElement.querySelector('#go-general') as HTMLAnchorElement).dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }));
    tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/', 'en-GB', 'home', 'term-and-conditions'],
      { fragment: 'general', replaceUrl: true },
    );
    expect(scrollSpy).toHaveBeenCalled();
  }));

  it('should ignore unsafe javascript links in content', fakeAsync(() => {
    createComponent();

    flushTermsFile(
      'assets/legal/terms.en-GB.html',
      `
      <div class="layout">
        <aside class="sidebar"><nav><a id="unsafe-link" href="javascript:void(0)">Unsafe</a></nav></aside>
        <main class="content"><section id="general">General section</section></main>
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

  it('should ignore mailto links in dynamic html', fakeAsync(() => {
    createComponent();

    flushTermsFile(
      'assets/legal/terms.en-GB.html',
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

    flushTermsFile(
      'assets/legal/terms.en-GB.html',
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
