import { TestBed } from '@angular/core/testing';
import { AuthRedirectEffect } from './auth-redirect.effect';
import { AuthStore } from '../store/auth.store';
import { NavigationService } from '../services/navigation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Role } from '../interfaces/token';
import { signal } from '@angular/core';
import { DEFAULT_LOCALE } from '../util/dates';

describe('AuthRedirectEffect', () => {
  let effect: AuthRedirectEffect;
  let authStoreSpy: {
    authReadyTrigger: ReturnType<typeof signal>;
    user: ReturnType<typeof signal>;
    isAuthenticated: ReturnType<typeof signal>;
    queryParams: ReturnType<typeof signal>;
  };

  let navigationServiceSpy: {
    reload: jasmine.Spy;
  };

  beforeEach(() => {
    authStoreSpy = {
      authReadyTrigger: signal(0),
      user: signal(undefined),
      isAuthenticated: signal(false),
      queryParams: signal(undefined),
    };

    navigationServiceSpy = {
      reload: jasmine.createSpy('reload'),
    };

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        AuthRedirectEffect,
        { provide: AuthStore, useValue: authStoreSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    });

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    effect = TestBed.inject(AuthRedirectEffect);
  });

  it('should create the effect', () => {
    TestBed.tick();
    expect(effect).toBeTruthy();
  });

  it('should NOT run when auth is not ready', () => {
    authStoreSpy.authReadyTrigger.set(0);

    TestBed.tick();

    expect(navigationServiceSpy.reload).not.toHaveBeenCalled();
  });

  it('should NOT run when user is not authenticated', () => {
    authStoreSpy.authReadyTrigger.set(Date.now());
    authStoreSpy.isAuthenticated.set(false);

    TestBed.tick();

    expect(navigationServiceSpy.reload).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard for admin role', () => {
    authStoreSpy.authReadyTrigger.set(Date.now());
    authStoreSpy.isAuthenticated.set(true);

    authStoreSpy.user.set({
      authorities: [{ authority: Role.admin }],
    });

    authStoreSpy.queryParams.set(undefined);

    TestBed.tick();

    expect(navigationServiceSpy.reload).toHaveBeenCalledWith(
      [DEFAULT_LOCALE, 'dashboard'],
      undefined,
      undefined,
    );
  });

  it('should redirect manager to dashboard events', () => {
    authStoreSpy.authReadyTrigger.set(Date.now());
    authStoreSpy.isAuthenticated.set(true);

    authStoreSpy.user.set({
      authorities: [{ authority: Role.roomAdmin }],
    });

    authStoreSpy.queryParams.set(undefined);

    TestBed.tick();

    expect(navigationServiceSpy.reload).toHaveBeenCalledWith(
      [DEFAULT_LOCALE, 'dashboard', 'events'],
      undefined,
      undefined,
    );
  });

  it('should redirect default user to reservations', () => {
    authStoreSpy.authReadyTrigger.set(Date.now());
    authStoreSpy.isAuthenticated.set(true);

    authStoreSpy.user.set({
      authorities: [],
    });

    authStoreSpy.queryParams.set(undefined);

    TestBed.tick();

    expect(navigationServiceSpy.reload).toHaveBeenCalledWith(
      [DEFAULT_LOCALE, 'me', 'reservations'],
      undefined,
      undefined,
    );
  });

  it('should redirect using decoded query params', () => {
    const state = {
      returnUrl: `/${DEFAULT_LOCALE}/test/page?foo=bar&x=1`,
      data: { id: 99 },
      lang: 'fr',
    };

    const encoded = btoa(JSON.stringify(state));

    authStoreSpy.authReadyTrigger.set(Date.now());
    authStoreSpy.isAuthenticated.set(true);
    authStoreSpy.user.set({ authorities: [] });

    authStoreSpy.queryParams.set({ state: encoded });

    TestBed.tick();

    expect(navigationServiceSpy.reload).toHaveBeenCalledWith(
      ['', DEFAULT_LOCALE, 'test', 'page'],
      { id: 99 },
      { foo: 'bar', x: '1' },
    );
  });
});
