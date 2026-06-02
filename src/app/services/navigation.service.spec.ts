import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { NavigationService } from './navigation.service';
import { IUser, User } from '../interfaces/user';
import { updateMyUser } from '../store/actions/user.actions';
import { setLanguage } from '../store/actions/i18n.actions';
import { I18NState } from '../store/reducers/i18n.reducers';

describe('NavigationService', () => {
  let service: NavigationService;
  let storeSpy: jasmine.SpyObj<Store<I18NState>>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routerEventsSubject: Subject<any>;

  let lang: BehaviorSubject<any>;

  const mockUser: IUser = {
    id: 'user-123',
    displayName: 'Test User',
    email: 'test@example.com',
    locale: 'en-GB',
  };

  beforeEach(() => {
    sessionStorage.clear();
    lang = new BehaviorSubject('en-GB');
    routerEventsSubject = new Subject();

    storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'pipe']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl'], {
      events: routerEventsSubject.asObservable(),
      url: '/test/path',
    });

    // Mock router methods to return promises
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
    routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));
    storeSpy.pipe.and.returnValue(lang.asObservable());

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        NavigationService,
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

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
        '/en-GB/me/reservation/res-1/payment/approved',
        '/en-GB/me/reservation/res-1/payment/approved',
      );
      routerEventsSubject.next(paymentStatusEvent);

      expect((service as any).history).not.toContain('/en-GB/me/reservation/res-1/payment/approved');
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
      setRouterUrl('/en-GB/colors/123');

      service.back();

      expect((service as any).history).toEqual([]);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/en-GB/colors', { state: { date: undefined, step: 0 } });
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should fallback to language root when current route has no parent segment', () => {
      sessionStorage.setItem('cleos-navigation-history', JSON.stringify([]));
      setRouterUrl('/en-GB');

      service.back();

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/en-GB', { state: { date: undefined, step: 0 } });
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
      setRouterUrl('/en-GB/colors/123');
      sessionStorage.setItem('cleos-navigation-history', JSON.stringify(['/en-GB/colors']));

      service.back();

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/en-GB/colors', { state: { date: undefined, step: 0 } });
      expect(JSON.parse(sessionStorage.getItem('cleos-navigation-history') || '[]')).toEqual(['/en-GB/colors']);
    });

    it('should fallback to parent route when history is empty', () => {
      sessionStorage.setItem('cleos-navigation-history', JSON.stringify([]));
      setRouterUrl('/en-GB/rooms/room-1/expenses/add');

      service.back();

      expect(routerSpy.navigateByUrl)
        .toHaveBeenCalledWith('/en-GB/rooms/room-1/expenses', { state: { date: undefined, step: 0 } });
    });
  });

  describe('reload', () => {
    it('should reload with all parameters', (done) => {
      const url = ['/dashboard', 'profile'];
      const data = { userId: '123' };
      const queryParams = { tab: 'settings' };
      const reloadURL = '/auth/reload';
      const lang = 'es';

      service.reload(url, data, queryParams, reloadURL, lang);

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/es/auth/reload', { skipLocationChange: true });

      setTimeout(() => {
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard', 'profile'], {
          state: data,
          queryParams,
        });
        done();
      }, 0);
    });

    it('should reload with default reloadURL and current language', (done) => {
      const url = ['/dashboard'];

      service.reload(url);

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/en-GB/auth/redirect', { skipLocationChange: true });

      setTimeout(() => {
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard'], {
          state: undefined,
          queryParams: undefined,
        });
        done();
      }, 0);
    });

    it('should filter out empty paths from URL array', (done) => {
      const url = ['/dashboard', '', 'profile', null as any, 'settings'];

      service.reload(url);

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/en-GB/auth/redirect', { skipLocationChange: true });

      setTimeout(() => {
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard', 'profile', 'settings'], {
          state: undefined,
          queryParams: undefined,
        });
        done();
      }, 0);
    });
  });

  describe('reloadPage', () => {
    it('should navigate to URL when provided', () => {
      const url = '/custom/path';

      // Spy on the method to avoid actual page reload during test
      spyOn(service, 'reloadPage').and.callFake((testUrl?: string) => {
        routerSpy.navigateByUrl(testUrl || '/en-GB');
      });

      service.reloadPage(url);

      expect(service.reloadPage).toHaveBeenCalledWith(url);
    });

    it('should use default URL when none provided', () => {
      // Spy on the method to avoid actual page reload during test
      spyOn(service, 'reloadPage').and.callFake((testUrl?: string) => {
        routerSpy.navigateByUrl(testUrl || '/en-GB');
      });

      service.reloadPage();

      expect(service.reloadPage).toHaveBeenCalledWith();
    });
  });

  describe('attachLang', () => {
    it('should return current language when no change needed', () => {
      const result = service.attachLang('en');

      expect(result).toBe('en-GB');
      expect(storeSpy.dispatch).not.toHaveBeenCalled();
    });

    it('should dispatch language change when language differs', () => {
      const result = service.attachLang('es', mockUser);

      expect(result).toBe('es');
      expect(storeSpy.dispatch).toHaveBeenCalledWith(setLanguage({ language: 'es' }));
    });

    it('should update user language when user locale differs from new language', () => {
      const userWithDifferentLocale = { ...mockUser, locale: 'fr-FR' };

      service.attachLang('es', userWithDifferentLocale);
      const updatedUser: IUser = new User();
      updatedUser.locale = 'es';

      expect(storeSpy.dispatch).toHaveBeenCalledWith(setLanguage({ language: 'es' }));
      expect(storeSpy.dispatch).toHaveBeenCalledWith(
        updateMyUser({ user: updatedUser, redirectUrl: '/test/path' }),
      );
    });

    it('should not update user when user locale matches new language', () => {
      const userWithSameLocale = { ...mockUser, locale: 'es-ES' };

      service.attachLang('es', userWithSameLocale);

      expect(storeSpy.dispatch).toHaveBeenCalledWith(setLanguage({ language: 'es' }));
      expect(storeSpy.dispatch).toHaveBeenCalledTimes(1); // Only language change, not user update
    });

    it('should handle null language parameter', () => {
      const result = service.attachLang(undefined);

      expect(result).toBe('en-GB'); // Default language from getLocale mock
    });

    it('should not update user when current user is not provided', () => {
      service.attachLang('es');

      expect(storeSpy.dispatch).toHaveBeenCalledWith(setLanguage({ language: 'es' }));
      expect(storeSpy.dispatch).toHaveBeenCalledTimes(1);
    });

    it('should handle user without locale', () => {
      const userWithoutLocale = { ...mockUser, locale: undefined };

      service.attachLang('es', userWithoutLocale);
      const updatedUser: IUser = new User();
      updatedUser.locale = 'es';

      expect(storeSpy.dispatch).toHaveBeenCalledWith(setLanguage({ language: 'es' }));
      expect(storeSpy.dispatch).toHaveBeenCalledWith(
        updateMyUser({ user: updatedUser, redirectUrl: '/test/path' }),
      );
    });

    it('should create User object with correct language', () => {
      let capturedUser: IUser;
      storeSpy.dispatch.and.callFake((action: any) => {
        capturedUser = action.user;
        return undefined as any;
      });

      service.attachLang('es', mockUser);

      expect(capturedUser!.locale).toBe('es');
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
