import { getTestBed, TestBed } from '@angular/core/testing';

import { authGuard, PermissionsService } from './auth-guard.service';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

let injector: TestBed;
let service: PermissionsService;
let guard: CanActivateFn;

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      PermissionsService,
      { provide: MatSnackBar, useValue: {} },
      { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      { provide: Store, useValue: { select: () => of({ user: { authorities: [{ authority: 'ROLE_USER' }] } }) } },
      { provide: TranslateService, useValue: { currentLang: 'en' } },
    ],
  });
  injector = getTestBed();
  service = injector.inject(PermissionsService);
  guard = authGuard;
});
describe('authGuard', () => {
  it('should allow activation if user has the required role', () => {
    const route = { data: { roles: ['ROLE_USER'] } } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    expect(guard(route, state)).toBeTrue();
  });

  it('should deny activation if user does not have the required role', () => {
    const route = { data: { roles: ['ROLE_ADMIN'] } } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    expect(guard(route, state)).toBeFalse();
  });

  it('should deny activation and redirect if user is not logged in', () => {
    service.currentUser = undefined;
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/test' } as RouterStateSnapshot;
    expect(guard(route, state)).toBeFalse();
    expect(injector.inject(Router).navigate)
      .toHaveBeenCalledWith(['en', 'auth'], { queryParams: { state: jasmine.any(String) } });
  });
});
