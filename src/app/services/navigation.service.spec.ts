import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { NavigationService } from './navigation.service';
import { UserStore } from '../store/user.store';
import { DEFAULT_LOCALE } from '../util/dates';
import { ElementRef, signal } from '@angular/core';
import { I18NStore } from '../store/i18n.store';
import { SeoService } from './seo.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ThemeService } from 'ng2-charts';
import { CookieService } from 'ngx-cookie-service';
import { DateAdapter } from '@angular/material/core';

describe('NavigationService', () => {
  let service: NavigationService;
  let i18nStoreSpy: {
    language: ReturnType<typeof signal>;
    setLanguage: Mock;
  };
  let userStoreSpy: {
    updateMyUser: Mock;
  };
  let seoSpy: Pick<SeoService, 'setMetaDescription' | 'setMetaTitle'> & {
    setMetaDescription: ReturnType<typeof vi.fn>;
    setMetaTitle: ReturnType<typeof vi.fn>;
  };
  let routerSpy: Pick<
    Router,
    'navigate' | 'navigateByUrl' | 'events' | 'url' | 'parseUrl'
  > & {
    navigate: ReturnType<typeof vi.fn>;
    navigateByUrl: ReturnType<typeof vi.fn>;
    parseUrl: ReturnType<typeof vi.fn>;
  };
  let activatedRouteSpy: {
    snapshot: {
      paramMap: {
        get: ReturnType<typeof vi.fn>;
      };
    };
  };
  let routerEventsSubject: Subject<any>;

  beforeEach(() => {
    sessionStorage.clear();
    routerEventsSubject = new Subject();

    i18nStoreSpy = {
      language: signal(DEFAULT_LOCALE),
      setLanguage: vi.fn().mockName('setLanguage'),
    };
    userStoreSpy = {
      updateMyUser: vi.fn().mockName('updateMyUser'),
    };
    routerSpy = {
      navigate: vi.fn().mockName('Router.navigate'),
      navigateByUrl: vi.fn().mockName('Router.navigateByUrl'),
      events: routerEventsSubject.asObservable(),
      url: '/test/path',
      parseUrl: vi
        .fn()
        .mockName('parseUrl')
        .mockImplementation((url: string) => {
          const hashIndex = url.indexOf('#');
          return {
            fragment:
              hashIndex >= 0
                ? decodeURIComponent(url.substring(hashIndex + 1))
                : null,
          };
        }),
    };
    const overlayContainerSpy = {
      getContainerElement: vi.fn(() => document.createElement('div')),
    };
    const themeServiceSpy = {
      setColorschemesOptions: vi.fn(),
    };
    seoSpy = {
      setMetaDescription: vi.fn().mockName('SeoService.setMetaDescription'),
      setMetaTitle: vi.fn().mockName('SeoService.setMetaTitle'),
    };
    const cookieServiceSpy = {
      get: vi.fn(() => 'light-theme'),
      set: vi.fn(),
    };

    cookieServiceSpy.get.mockReturnValue('light-theme');
    overlayContainerSpy.getContainerElement.mockReturnValue(
      document.createElement('div'),
    );

    routerSpy.navigate.mockResolvedValue(true);
    routerSpy.navigateByUrl.mockResolvedValue(true);
    activatedRouteSpy = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockName('ParamMap.get'),
        },
      },
    };

    Element.prototype.scrollIntoView = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        NavigationService,
        { provide: I18NStore, useValue: i18nStoreSpy },
        { provide: UserStore, useValue: userStoreSpy },
        { provide: SeoService, useValue: seoSpy },
        { provide: OverlayContainer, useValue: overlayContainerSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: ThemeService, useValue: themeServiceSpy },
        { provide: DateAdapter, useValue: { setLocale: vi.fn() } },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        {
          provide: ElementRef,
          useValue: new ElementRef(document.createElement('div')),
        },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    });

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);
    translateService.setTranslation(DEFAULT_LOCALE, {
      META: { CONTENT: 'desc', TITLE: 'title' },
    });

    service = TestBed.inject(NavigationService);
  });

  afterEach(() => {
    sessionStorage.clear();
    routerEventsSubject.complete();
  });

  const setRouterUrl = (url: string) => {
    Object.defineProperty(routerSpy, 'url', {
      configurable: true,
      value: url,
    });
  };

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call seoService and reset theme when authUser emits', () => {
    service.resetConfig('es');

    expect(seoSpy.setMetaDescription).toHaveBeenCalledWith('desc');
    expect(seoSpy.setMetaTitle).toHaveBeenCalledWith('title');
    expect(i18nStoreSpy.setLanguage).toHaveBeenCalledWith('es');
  });

  describe('constructor', () => {
    it('should subscribe to router events on creation', () => {
      const navigationEndEvent = new NavigationEnd(
        1,
        '/test/path',
        '/test/path',
      );
      routerEventsSubject.next(navigationEndEvent);

      expect((service as any).history).toContain('/test/path');
      expect(
        JSON.parse(sessionStorage.getItem('cleos-navigation-history') || '[]'),
      ).toContain('/test/path');
    });

    it('should not add payment success URLs to history', () => {
      const paymentSuccessEvent = new NavigationEnd(
        1,
        '/payment/success?token=123',
        '/payment/success?token=123',
      );
      routerEventsSubject.next(paymentSuccessEvent);

      expect((service as any).history).not.toContain(
        '/payment/success?token=123',
      );
    });

    it('should not add payment failure URLs to history', () => {
      const paymentFailureEvent = new NavigationEnd(
        1,
        '/payment/failure?error=1',
        '/payment/failure?error=1',
      );
      routerEventsSubject.next(paymentFailureEvent);

      expect((service as any).history).not.toContain(
        '/payment/failure?error=1',
      );
    });

    it('should not add payment status callback routes to history', () => {
      const paymentStatusEvent = new NavigationEnd(
        1,
        `/${DEFAULT_LOCALE}/me/reservation/res-1/payment/approved`,
        `/${DEFAULT_LOCALE}/me/reservation/res-1/payment/approved`,
      );
      routerEventsSubject.next(paymentStatusEvent);

      expect((service as any).history).not.toContain(
        `/${DEFAULT_LOCALE}/me/reservation/res-1/payment/approved`,
      );
    });

    it('should ignore non-NavigationEnd events', () => {
      const otherEvent = { id: 1, url: '/test' };
      routerEventsSubject.next(otherEvent);

      expect((service as any).history).toEqual(['/test/path']);
    });

    it('should avoid duplicate consecutive entries', () => {
      routerEventsSubject.next(
        new NavigationEnd(1, '/test/path', '/test/path'),
      );
      routerEventsSubject.next(
        new NavigationEnd(2, '/test/path', '/test/path'),
      );

      expect((service as any).history).toEqual(['/test/path']);
    });

    it('should keep subscribe as a safe no-op after construction', () => {
      service.subscribe();

      routerEventsSubject.next(new NavigationEnd(1, '/page-1', '/page-1'));
      routerEventsSubject.next(new NavigationEnd(2, '/page-1', '/page-1'));

      expect((service as any).history).toEqual(['/test/path', '/page-1']);
    });
  });

  describe('back', () => {
    beforeEach(() => {
      // Setup history with some URLs
      (service as any).history = ['/page1', '/page2', '/page3'];
    });

    it('should navigate to previous URL when history is available', () => {
      const testDate = new Date('2024-01-15');
      const step = 2;
      setRouterUrl('/page3');
      sessionStorage.setItem(
        'cleos-navigation-history',
        JSON.stringify(['/page1', '/page2', '/page3']),
      );

      service.back(testDate, step);

      expect((service as any).history).toEqual(['/page1', '/page2']);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/page2', {
        state: { date: testDate, step },
      });
    });

    it('should navigate to previous URL with default parameters', () => {
      setRouterUrl('/page3');
      sessionStorage.setItem(
        'cleos-navigation-history',
        JSON.stringify(['/page1', '/page2', '/page3']),
      );

      service.back();

      expect((service as any).history).toEqual(['/page1', '/page2']);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/page2', {
        state: { date: undefined, step: 0 },
      });
    });

    it('should navigate to parent route when no previous history is available', () => {
      sessionStorage.setItem('cleos-navigation-history', JSON.stringify([]));
      setRouterUrl(`/${DEFAULT_LOCALE}/colors/123`);

      service.back();

      expect((service as any).history).toEqual([]);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(
        `/${DEFAULT_LOCALE}/colors`,
        { state: { date: undefined, step: 0 } },
      );
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should fallback to language root when current route has no parent segment', () => {
      sessionStorage.setItem('cleos-navigation-history', JSON.stringify([]));
      setRouterUrl(`/${DEFAULT_LOCALE}`);

      service.back();

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(
        `/${DEFAULT_LOCALE}`,
        { state: { date: undefined, step: 0 } },
      );
    });

    it('should read persisted history when in-memory history is empty after reload', () => {
      (service as any).history = [];
      setRouterUrl('/page-b');
      sessionStorage.setItem(
        'cleos-navigation-history',
        JSON.stringify(['/page-a', '/page-b']),
      );

      service.back();

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/page-a', {
        state: { date: undefined, step: 0 },
      });
      expect(
        JSON.parse(sessionStorage.getItem('cleos-navigation-history') || '[]'),
      ).toEqual(['/page-a']);
    });

    it('should sync current route before going back when current page was not persisted', () => {
      (service as any).history = [];
      setRouterUrl(`/${DEFAULT_LOCALE}/colors/123`);
      sessionStorage.setItem(
        'cleos-navigation-history',
        JSON.stringify([`/${DEFAULT_LOCALE}/colors`]),
      );

      service.back();

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(
        `/${DEFAULT_LOCALE}/colors`,
        { state: { date: undefined, step: 0 } },
      );
      expect(
        JSON.parse(sessionStorage.getItem('cleos-navigation-history') || '[]'),
      ).toEqual([`/${DEFAULT_LOCALE}/colors`]);
    });

    it('should fallback to parent route when history is empty', () => {
      sessionStorage.setItem('cleos-navigation-history', JSON.stringify([]));
      setRouterUrl(`/${DEFAULT_LOCALE}/rooms/room-1/expenses/add`);

      service.back();

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(
        `/${DEFAULT_LOCALE}/rooms/room-1/expenses`,
        { state: { date: undefined, step: 0 } },
      );
    });
  });

  describe('reload', () => {
    it('should navigate with filtered URL segments', () => {
      const url = ['/dashboard', '', 'profile'];
      const data = { userId: '123' };
      const queryParams = { tab: 'settings' };

      service.reload(url, data, queryParams);

      expect(routerSpy.navigate).toHaveBeenCalledWith(
        ['/dashboard', 'profile'],
        {
          state: data,
          queryParams,
        },
      );
    });

    it('should handle empty params', () => {
      service.reload(['/home']);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/home'], {
        state: undefined,
        queryParams: undefined,
      });
    });
  });

  describe('navigation history management', () => {
    it('should maintain history correctly through multiple navigations', () => {
      // Add multiple navigation events
      routerEventsSubject.next(new NavigationEnd(1, '/page1', '/page1'));
      routerEventsSubject.next(new NavigationEnd(2, '/page2', '/page2'));
      routerEventsSubject.next(new NavigationEnd(3, '/page3', '/page3'));

      expect((service as any).history).toEqual([
        '/test/path',
        '/page1',
        '/page2',
        '/page3',
      ]);
    });

    it('should handle back navigation correctly', () => {
      setRouterUrl('/page3');
      sessionStorage.setItem(
        'cleos-navigation-history',
        JSON.stringify(['/page1', '/page2', '/page3']),
      );

      service.back();
      expect((service as any).history).toEqual(['/page1', '/page2']);
      expect(
        JSON.parse(sessionStorage.getItem('cleos-navigation-history') || '[]'),
      ).toEqual(['/page1', '/page2']);

      setRouterUrl('/page2');
      service.back();
      expect((service as any).history).toEqual(['/page1']);
      expect(
        JSON.parse(sessionStorage.getItem('cleos-navigation-history') || '[]'),
      ).toEqual(['/page1']);
    });
  });

  describe('navigate', () => {
    it('should navigate using language-prefixed path and call callback when provided', async () => {
      const callback = vi.fn().mockName('callback');
      const path = ['home', 'profile'];
      const extras = { queryParams: { tab: 'info' } } as any;

      service.navigate(path, extras, callback);

      await Promise.resolve();

      expect(routerSpy.navigate).toHaveBeenCalledWith(
        [`/${DEFAULT_LOCALE}/home/profile`],
        extras,
      );

      expect(callback).toHaveBeenCalled();
    });

    it('should navigate to current url when path is undefined', async () => {
      const callback = vi.fn().mockName('callback');

      setRouterUrl('/current/page');

      service.navigate(undefined, undefined, callback);

      await Promise.resolve();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/current/page']);
      expect(callback).toHaveBeenCalled();
    });

    it('should not throw if callback is not provided', async () => {
      expect(async () => {
        service.navigate(['test']);
        await Promise.resolve();
      }).not.toThrow();

      expect(routerSpy.navigate).toHaveBeenCalled();
    });
  });

  describe('scrollToAnchor', () => {
    let hostElement: Pick<HTMLElement, 'querySelector'> & {
      querySelector: ReturnType<typeof vi.fn>;
    };
    let element: HTMLElement;
    let scrollSpy: Mock;

    beforeEach(() => {
      hostElement = {
        querySelector: vi.fn().mockName('HTMLElement.querySelector'),
      };

      element = document.createElement('div');
      element.id = 'section1';

      scrollSpy = vi
        .spyOn(element, 'scrollIntoView')
        .mockReturnValue(undefined);

      hostElement.querySelector.mockReturnValue(element as any);
    });

    it('should scroll to trimmed id when provided', () => {
      service.scrollToAnchor(hostElement, '  section1  ');

      expect(scrollSpy).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    });

    it('should use router fragment when id is not provided', () => {
      setRouterUrl('/page#section1');

      service.scrollToAnchor(hostElement);

      expect(scrollSpy).toHaveBeenCalled();
    });

    it('should do nothing when no anchor is found', () => {
      hostElement.querySelector.mockReturnValue(null);

      service.scrollToAnchor(hostElement, 'missing');

      expect(hostElement.querySelector).toHaveBeenCalledWith('#missing');
      expect(scrollSpy).not.toHaveBeenCalled();
    });

    it('should return early when no id and no fragment exist', () => {
      setRouterUrl('/page');

      service.scrollToAnchor(hostElement);

      expect(hostElement.querySelector).not.toHaveBeenCalled();
      expect(scrollSpy).not.toHaveBeenCalled();
    });
  });
});
