import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { UserService } from '../services/user.service';
import { IOverview, IUser, IUserAll } from '../user/user';
import { Role, Token } from '../interfaces/token';
import { loginSuccess } from './actions/auth.actions';
import { UserStore } from './user.store';
import { DEFAULT_LOCALE } from '../util/dates';

describe('UserStore', () => {
  let store: InstanceType<typeof UserStore>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let translateSpy: jasmine.SpyObj<TranslateService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let ngrxStoreSpy: jasmine.SpyObj<Store>;

  const user = {
    id: 'user-1',
    displayName: 'User One',
    email: 'user@test.com',
    locale: DEFAULT_LOCALE,
    authorities: [{ authority: Role.customer }],
    timeZone: 'Europe/Amsterdam',
  } as IUserAll;

  const token: Token = {
    tokenAccess: 'access-token',
    user,
    menus: [],
  };

  beforeEach(() => {
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', [
      'getUsersPage',
      'getCustomers',
      'getAllDisableUsers',
      'getUser',
      'getMyUser',
      'getCustomerOverview',
      'saveUser',
      'setRole',
      'updateMyUser',
      'updateMyPhoto',
      'deleteUser',
      'restore',
      'resendToken',
      'mergeUsers',
    ]);
    translateSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant', 'getCurrentLang']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    ngrxStoreSpy = jasmine.createSpyObj<Store>('Store', ['dispatch']);

    translateSpy.instant.and.callFake((key: string, params?: Record<string, string>) =>
      params?.['role'] ? `${ key }:${ params['role'] }`
        : params?.['displayName'] ? `${ key }:${ params['displayName'] }`
          : key);
    translateSpy.getCurrentLang.and.returnValue(DEFAULT_LOCALE);

    TestBed.configureTestingModule({
      providers: [
        UserStore,
        { provide: UserService, useValue: userServiceSpy },
        { provide: TranslateService, useValue: translateSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Store, useValue: ngrxStoreSpy },
      ],
    });

    store = TestBed.inject(UserStore);
  });

  it('should load page, customers, disabled users, selected user, my user, and overview', () => {
    const page = { content: [user], totalElements: 1 } as any;
    const overview = { miniCardOverview: [], chartOverview: [], account: {} } as unknown as IOverview;
    userServiceSpy.getUsersPage.and.returnValue(of(page));
    userServiceSpy.getCustomers.and.returnValue(of([user]));
    userServiceSpy.getAllDisableUsers.and.returnValue(of([user]));
    userServiceSpy.getUser.and.returnValue(of(user));
    userServiceSpy.getMyUser.and.returnValue(of(user));
    userServiceSpy.getCustomerOverview.and.returnValue(of(overview));

    store.loadPage({ page: 1, sort: 'displayName', direction: 'asc', size: 25, filter: 'ann' });
    store.loadCustomers();
    store.loadDisabledUsers();
    store.loadById('user-1');
    store.loadMyUser();
    store.loadOverview('user-1');

    expect(userServiceSpy.getUsersPage).toHaveBeenCalledWith(1, 'displayName', 'asc', 25, 'ann');
    expect(store.pagination()).toEqual(page);
    expect(store.customers()).toEqual([user]);
    expect(store.users()).toEqual([user]);
    expect(store.selected()).toEqual(user);
    expect(store.overview()).toEqual(overview);
    expect(store.isLoading()).toBeFalse();
  });

  it('should set navigation params and navigate when selecting a user', () => {
    store.setNavigationParams({ role: Role.manager });
    store.selectAndNavigate(user);

    expect(store.userNavigationParams()).toEqual({ role: Role.manager });
    expect(store.selected()).toEqual(user);
    expect(routerSpy.navigate).toHaveBeenCalledWith([DEFAULT_LOCALE, 'users', user.id]);
  });

  it('should expose response metadata for user mutations', () => {
    userServiceSpy.saveUser.and.returnValue(of({
      key: 'USER.CUSTOMER',
      response: { id: 'user-2', name: 'New User' },
    }));
    userServiceSpy.setRole.and.returnValue(of(user));
    userServiceSpy.deleteUser.and.returnValue(of(void 0));
    userServiceSpy.restore.and.returnValue(of({ id: 'user-1', name: 'User One' }));
    userServiceSpy.resendToken.and.returnValue(of(void 0));
    userServiceSpy.mergeUsers.and.returnValue(of(user));

    store.save({ displayName: 'New User' }, undefined, Role.customer);
    expect(store.response()).toEqual(jasmine.objectContaining({
      message: 'USER.CUSTOMER:New User',
      path: 'users/user-2',
      redirect: 'users',
    }));

    store.setRole('user-1', 'User One', Role.admin, 'ADD');
    expect(store.response()).toEqual(jasmine.objectContaining({
      message: 'USER.ROLES.ADD:COMMON.ROLES.ROLE_ADMIN',
      path: 'users/user-1',
    }));

    store.delete('user-1', 'User One');
    expect(store.response()).toEqual({
      message: 'USER.DELETED.MESSAGE:User One',
      toastType: 'warning',
      reload: true,
    });

    store.restore('user-1', { deleted: false });
    expect(store.response()).toEqual(jasmine.objectContaining({
      message: 'USER.RESTORE.MESSAGE:User One',
    }));

    store.resendToken('user-1');
    expect(store.response()).toEqual(jasmine.objectContaining({
      message: 'USER.ACTIVATION_RESEND.MESSAGE',
    }));

    store.mergeUsers('old-user', 'new-user');
    expect(store.response()).toEqual(jasmine.objectContaining({
      message: 'USER.MERGE.SUCCESS',
    }));
    expect(store.isLoading()).toBeFalse();
  });

  it('should update profile data and dispatch login success', () => {
    const updatedUser: IUser = { locale: 'es', displayName: 'Updated User' };
    userServiceSpy.updateMyUser.and.returnValue(of(token));

    store.updateMyUser(updatedUser, '/es/auth/profile', 'PROFILE.UPDATED');

    expect(userServiceSpy.updateMyUser).toHaveBeenCalledWith(updatedUser);
    expect(store.response()).toEqual({
      message: 'PROFILE.UPDATED',
      toastType: 'success',
    });
    expect(ngrxStoreSpy.dispatch).toHaveBeenCalledWith(loginSuccess({
      token,
      queryParams: {
        state: btoa(JSON.stringify({ returnUrl: '/es/auth/profile', lang: 'es' })),
      },
    }));
  });

  it('should update profile photo and dispatch login success with current language', () => {
    userServiceSpy.updateMyPhoto.and.returnValue(of(token));

    store.updateMyPhoto('data:image/jpeg;base64,AAA');

    expect(userServiceSpy.updateMyPhoto).toHaveBeenCalledWith('data:image/jpeg;base64,AAA');
    expect(store.response()).toEqual({
      message: 'COMMON.PROFILE.UPDATED.PHOTO',
      toastType: 'success',
    });
    expect(ngrxStoreSpy.dispatch).toHaveBeenCalledWith(loginSuccess({
      token,
      queryParams: {
        state: btoa(JSON.stringify({ returnUrl: `/${DEFAULT_LOCALE}/auth/profile`, lang: DEFAULT_LOCALE })),
      },
    }));
  });

  it('should clear response, clear errors, and clean state', () => {
    userServiceSpy.saveUser.and.returnValue(of({
      key: 'USER.CUSTOMER',
      response: { id: 'user-2', name: 'New User' },
    }));

    store.save({ displayName: 'New User' }, undefined, Role.customer);
    store.clearResponse();
    store.clearError();
    store.setNavigationParams({ role: Role.customer });
    store.clean();

    expect(store.response()).toBeUndefined();
    expect(store.error()).toBeUndefined();
    expect(store.subErrors()).toBeUndefined();
    expect(store.userNavigationParams()).toBeUndefined();
    expect(store.isLoading()).toBeFalse();
  });

  it('should map service failures into error state', () => {
    userServiceSpy.getUser.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 400,
      error: {
        message: 'USER.INVALID',
        subErrors: [{ field: 'email', message: 'Invalid email' }],
      },
    })));

    store.loadById('missing');

    expect(store.response()).toBeUndefined();
    expect(store.error()).toEqual(jasmine.objectContaining({
      message: 'USER.INVALID',
      subErrors: [{ field: 'email', message: 'Invalid email' }],
    }));
    expect(store.subErrors()).toEqual([{ field: 'email', message: 'Invalid email' }]);
    expect(store.isLoading()).toBeFalse();
  });
});
