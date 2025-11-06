import { TestBed } from '@angular/core/testing';

import { authGuard, PermissionsService } from './auth-guard.service';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastService } from './toast.service';
import { of } from 'rxjs';

describe('authGuard', () => {
  let service: PermissionsService;
  let guard: CanActivateFn;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['info']);

    routerSpy.getCurrentNavigation.and.returnValue(null);
    storeSpy.select.and.returnValue(of({ user: { authorities: [{ authority: 'ROLE_USER' }] } }));

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        PermissionsService,
        { provide: Router, useValue: routerSpy },
        { provide: Store, useValue: storeSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    service = TestBed.inject(PermissionsService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');
    guard = authGuard;
  });

  it('should allow activation if user has the required role', () => {
    const route = { data: { roles: ['ROLE_USER'] } } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => {
      expect(guard(route, state)).toBeTruthy();
    });
  });

  it('should deny activation if user does not have the required role', () => {
    const route = { data: { roles: ['ROLE_ADMIN'] } } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => {
      expect(guard(route, state)).toBeFalsy();
    });
  });

  it('should deny activation and redirect if user is not logged in', () => {
    service.currentUser = undefined;
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/test' } as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => {
      expect(guard(route, state)).toBeFalsy();
      expect(router.navigate).toHaveBeenCalledWith(['en-GB', 'auth'], { queryParams: { state: jasmine.any(String) } });
    });
  });
});
