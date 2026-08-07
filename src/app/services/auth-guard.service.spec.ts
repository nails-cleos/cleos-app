import { TestBed } from '@angular/core/testing';

import { PermissionsService } from './auth-guard.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { ToastService } from './toast.service';
import { BehaviorSubject, of } from 'rxjs';
import { DEFAULT_LOCALE } from '../util/dates';
import { signal } from '@angular/core';
import { AuthStore } from '../store/auth.store';
import { NavigationService } from './navigation.service';

describe('authGuard', () => {
  let service: PermissionsService;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let action$: BehaviorSubject<any>;

  let authStoreSpy: {
    user: ReturnType<typeof signal>;
    authRedirect: jasmine.Spy;
  };

  beforeEach(() => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );
    authStoreSpy = {
      user: signal({ authorities: [{ authority: 'ROLE_USER' }] }),
      authRedirect: jasmine.createSpy('authRedirect'),
    };
    action$ = new BehaviorSubject(undefined);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);


    toastServiceSpy.show.and.returnValue({
      onAction: () => action$.asObservable(),
      onDismiss: () => of(void 0),
    });

    TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        PermissionsService,
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: AuthStore, useValue: authStoreSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    });

    service = TestBed.inject(PermissionsService);

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);
  });

  it('should allow activation if user has the required role', () => {
    const route = { data: { roles: ['ROLE_USER'] } } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;


    TestBed.runInInjectionContext(() => {
      expect(service.canActivate(route, state)).toBeTrue();
    });
  });

  it('should deny activation if user does not have the required role', () => {
    const route = { data: { roles: ['ROLE_ADMIN'] } } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => {
      expect(service.canActivate(route, state)).toBeFalse();
    });
  });

  it('should deny activation and redirect if user is not logged in', () => {
    authStoreSpy.user.set(undefined);
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/test' } as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => {
      expect(service.canActivate(route, state)).toBeFalse();
      expect(navigationServiceSpy.navigate)
        .toHaveBeenCalledWith(['auth'], { queryParams: { state: jasmine.any(String) } });
    });
  });
});
