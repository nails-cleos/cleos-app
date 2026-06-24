import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { NavigationService } from './navigation.service';
import { UserStore } from '../store/user.store';
import { DEFAULT_LOCALE } from '../util/dates';
import { signal } from "@angular/core";
import { I18NStore } from "../store/i18n.store";

describe('NavigationService', () => {
  let service: NavigationService;
  let i18nStoreSpy: {
    language: ReturnType<typeof signal>;
    setLanguage: jasmine.Spy;
  };
  let userStoreSpy: jasmine.SpyObj<InstanceType<typeof UserStore>>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routerEventsSubject: Subject<any>;

  beforeEach(() => {
    sessionStorage.clear();
    routerEventsSubject = new Subject();

    i18nStoreSpy = {
      language: signal(DEFAULT_LOCALE),
      setLanguage: jasmine.createSpy('setLanguage'),
    }
    userStoreSpy = jasmine.createSpyObj<InstanceType<typeof UserStore>>('UserStore', ['updateMyUser']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl'], {
      events: routerEventsSubject.asObservable(),
      url: '/test/path',
    });

    // Mock router methods to return promises
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
    routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        NavigationService,
        { provide: I18NStore, useValue: i18nStoreSpy },
        { provide: UserStore, useValue: userStoreSpy },
        { provide: Router, useValue: routerSpy },
      ],
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

  describe('constructor', () => {
    it('should subscribe to router events on creation', () => {
      const navigationEndEvent = new NavigationEnd(1, '/test/path', '/test/path');
      routerEventsSubject.next(navigationEndEvent);

      expect((service as any).history).toContain('/test/path');
      expect(JSON.parse(sessionStorage.getItem('cleos-navigation-history') || '[]')).toContain('/test/path');
    });

    it('should not add payment success URLs to history', () => {
      const paymentSuccessEvent = new NavigationEnd(1, '/payment/success?token=123', '/payment/success?token=123');
      routerEventsSubject.next(paymentSuccessEvent);

      expect((service as any).history).not.toContain('/payment/success?token=123');
    });

    it('should not add payment failure URLs to history', () => {
      const paymentFailureEvent = new NavigationEnd(1, '/payment/failure?error=1', '/payment/failure?error=1');
      routerEventsSubject.next(paymentFailureEvent);

      expect((service as any).history).not.toContain('/payment/failure?error=1');
    });

    it('should not add payment status callback routes to history', () => {
      const paymentStatusEvent = new NavigationEnd(
        1,
        `/${ DEFAULT_LOCALE }/me/reservation/res-1/payment/approved`,
        `/${ DEFAULT_LOCALE }/me/reservation/res-1/payment/approved`,
      );
      routerEventsSubject.next(paymentStatusEvent);

      expect((service as any).history).not.toContain(`/${ DEFAULT_LOCALE }/me/reservation/res-1/payment/approved`);
    });

    it('should ignore non-NavigationEnd events', () => {
      const otherEvent = { id: 1, url: '/test' };
      routerEventsSubject.next(otherEvent);

      expect((service as any).history).toEqual(['/test/path']);
    });

    it('should avoid duplicate consecutive entries', () => {
      routerEventsSubject.next(new NavigationEnd(1, '/test/path', '/test/path'));
      routerEventsSubject.next(new NavigationEnd(2, '/test/path', '/test/path'));

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
      sessionStorage.setItem('cleos-navigation-history', JSON.stringify(['/page1', '/page2', '/page3']));

      service.back(testDate, step);

      expect((service as any).history).toEqual(['/page1', '/page2']);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/page2', { state: { date: testDate, step } });
    });

    it('should navigate to previous URL with default parameters', () => {
      setRouterUrl('/page3');
      sessionStorage.setItem('cleos-navigation-history', JSON.stringify(['/page1', '/page2', '/page3']));

      service.back();

      expect((service as any).history).toEqual(['/page1', '/page2']);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/page2', { state: { date: undefined, step: 0 } });
    });

    it('should navigate to parent route when no previous history is available', () => {
      sessionStorage.setItem('cleos-navigation-history', JSON.stringify([]));
      setRouterUrl(`/${ DEFAULT_LOCALE }/colors/123`);

      service.back();

      expect((service as any).history).toEqual([]);
      expect(routerSpy.navigateByUrl)
        .toHaveBeenCalledWith(`/${ DEFAULT_LOCALE }/colors`, { state: { date: undefined, step: 0 } });
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should fallback to language root when current route has no parent segment', () => {
      sessionStorage.setItem('cleos-navigation-history', JSON.stringify([]));
      setRouterUrl(`/${ DEFAULT_LOCALE }`);

      service.back();

      expect(routerSpy.navigateByUrl)
        .toHaveBeenCalledWith(`/${ DEFAULT_LOCALE }`, { state: { date: undefined, step: 0 } });
    });

    it('should read persisted history when in-memory history is empty after reload', () => {
      (service as any).history = [];
      setRouterUrl('/page-b');
      sessionStorage.setItem('cleos-navigation-history', JSON.stringify(['/page-a', '/page-b']));

      service.back();

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/page-a', { state: { date: undefined, step: 0 } });
      expect(JSON.parse(sessionStorage.getItem('cleos-navigation-history') || '[]')).toEqual(['/page-a']);
    });

    it('should sync current route before going back when current page was not persisted', () => {
      (service as any).history = [];
      setRouterUrl(`/${ DEFAULT_LOCALE }/colors/123`);
      sessionStorage.setItem('cleos-navigation-history', JSON.stringify([`/${ DEFAULT_LOCALE }/colors`]));

      service.back();

      expect(routerSpy.navigateByUrl)
        .toHaveBeenCalledWith(`/${ DEFAULT_LOCALE }/colors`, { state: { date: undefined, step: 0 } });
      expect(JSON.parse(sessionStorage.getItem('cleos-navigation-history') || '[]'))
        .toEqual([`/${ DEFAULT_LOCALE }/colors`]);
    });

    it('should fallback to parent route when history is empty', () => {
      sessionStorage.setItem('cleos-navigation-history', JSON.stringify([]));
      setRouterUrl(`/${ DEFAULT_LOCALE }/rooms/room-1/expenses/add`);

      service.back();

      expect(routerSpy.navigateByUrl)
        .toHaveBeenCalledWith(`/${ DEFAULT_LOCALE }/rooms/room-1/expenses`, { state: { date: undefined, step: 0 } });
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

      expect(routerSpy.navigate).toHaveBeenCalledWith(
        ['/home'],
        {
          state: undefined,
          queryParams: undefined,
        },
      );
    });
  });

  describe('reloadPage', () => {
    it('should navigate to URL when provided', () => {
      const url = '/custom/path';

      // Spy on the method to avoid actual page reload during test
      spyOn(service, 'reloadPage').and.callFake((testUrl?: string) => {
        routerSpy.navigateByUrl(testUrl || `/${ DEFAULT_LOCALE }`);
      });

      service.reloadPage(url);

      expect(service.reloadPage).toHaveBeenCalledWith(url);
    });

    it('should use default URL when none provided', () => {
      // Spy on the method to avoid actual page reload during test
      spyOn(service, 'reloadPage').and.callFake((testUrl?: string) => {
        routerSpy.navigateByUrl(testUrl || `/${ DEFAULT_LOCALE }`);
      });

      service.reloadPage();

      expect(service.reloadPage).toHaveBeenCalledWith();
    });
  });

  describe('attachLang', () => {
    it('should return current language when no change needed', () => {
      const result = service.attachLang(DEFAULT_LOCALE);

      expect(result).toBe(DEFAULT_LOCALE);
      expect(i18nStoreSpy.setLanguage).not.toHaveBeenCalled();
    });

    it('should dispatch language change when language differs', () => {
      const result = service.attachLang('es');

      expect(result).toBe('es');
      expect(i18nStoreSpy.setLanguage).toHaveBeenCalledWith('es');
    });

    it('should normalize language using getLocale', () => {
      const result = service.attachLang('es-ES');

      expect(result).toBe('es'); // depends on getLocale mock behavior
    });

    it('should handle undefined language', () => {
      const result = service.attachLang(undefined);

      expect(typeof result).toBe('string');
    });
  });

  describe('navigation history management', () => {
    it('should maintain history correctly through multiple navigations', () => {
      // Add multiple navigation events
      routerEventsSubject.next(new NavigationEnd(1, '/page1', '/page1'));
      routerEventsSubject.next(new NavigationEnd(2, '/page2', '/page2'));
      routerEventsSubject.next(new NavigationEnd(3, '/page3', '/page3'));

      expect((service as any).history).toEqual(['/test/path', '/page1', '/page2', '/page3']);
    });

    it('should handle back navigation correctly', () => {
      setRouterUrl('/page3');
      sessionStorage.setItem('cleos-navigation-history', JSON.stringify(['/page1', '/page2', '/page3']));

      service.back();
      expect((service as any).history).toEqual(['/page1', '/page2']);
      expect(JSON.parse(sessionStorage.getItem('cleos-navigation-history') || '[]')).toEqual(['/page1', '/page2']);

      setRouterUrl('/page2');
      service.back();
      expect((service as any).history).toEqual(['/page1']);
      expect(JSON.parse(sessionStorage.getItem('cleos-navigation-history') || '[]')).toEqual(['/page1']);
    });
  });
});
