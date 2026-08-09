import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { UserService } from '../services/user.service';
import { IOverview, IUser, IUserAll } from '../user/user';
import { Role, Token } from '../interfaces/token';
import { UserStore } from './user.store';
import { DEFAULT_LOCALE } from '../util/dates';
import { AuthStore } from './auth.store';
import { NavigationService } from '../services/navigation.service';
describe('UserStore', () => {
  let store: InstanceType<typeof UserStore>;
  let navigationServiceSpy: Pick<NavigationService, 'navigate' | 'language'> & {
    navigate: ReturnType<typeof vi.fn>;
  };

  let userServiceSpy: {
    getUsersPage: Mock;
    getCustomers: Mock;
    getAllDisableUsers: Mock;
    getUser: Mock;
    getMyUser: Mock;
    getCustomerOverview: Mock;
    saveUser: Mock;
    setRole: Mock;
    updateMyUser: Mock;
    updateMyPhoto: Mock;
    deleteUser: Mock;
    restore: Mock;
    resendToken: Mock;
    mergeUsers: Mock;
  };
  let translateSpy: {
    instant: Mock;
    getCurrentLang: Mock;
  };
  let authStoreSpy: {
    loginSuccess: Mock;
  };

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
    navigationServiceSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    authStoreSpy = {
      loginSuccess: vi.fn().mockName('loginSuccess'),
    };
    userServiceSpy = {
      getUsersPage: vi.fn().mockName('UserService.getUsersPage'),
      getCustomers: vi.fn().mockName('UserService.getCustomers'),
      getAllDisableUsers: vi.fn().mockName('UserService.getAllDisableUsers'),
      getUser: vi.fn().mockName('UserService.getUser'),
      getMyUser: vi.fn().mockName('UserService.getMyUser'),
      getCustomerOverview: vi.fn().mockName('UserService.getCustomerOverview'),
      saveUser: vi.fn().mockName('UserService.saveUser'),
      setRole: vi.fn().mockName('UserService.setRole'),
      updateMyUser: vi.fn().mockName('UserService.updateMyUser'),
      updateMyPhoto: vi.fn().mockName('UserService.updateMyPhoto'),
      deleteUser: vi.fn().mockName('UserService.deleteUser'),
      restore: vi.fn().mockName('UserService.restore'),
      resendToken: vi.fn().mockName('UserService.resendToken'),
      mergeUsers: vi.fn().mockName('UserService.mergeUsers'),
    };
    translateSpy = {
      instant: vi.fn().mockName('TranslateService.instant'),
      getCurrentLang: vi.fn().mockName('TranslateService.getCurrentLang'),
    };

    translateSpy.instant.mockImplementation(
      (key: string, params?: Record<string, string>) =>
        params?.['role']
          ? `${key}:${params['role']}`
          : params?.['displayName']
            ? `${key}:${params['displayName']}`
            : key,
    );
    translateSpy.getCurrentLang.mockReturnValue(DEFAULT_LOCALE);

    TestBed.configureTestingModule({
      providers: [
        UserStore,
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: TranslateService, useValue: translateSpy },
        { provide: AuthStore, useValue: authStoreSpy },
      ],
    });

    store = TestBed.inject(UserStore);
  });

  it('should load page, customers, disabled users, selected user, my user, and overview', () => {
    const page = { content: [user], totalElements: 1 } as any;
    const overview = {
      miniCardOverview: [],
      chartOverview: [],
      account: {},
    } as unknown as IOverview;
    userServiceSpy.getUsersPage.mockReturnValue(of(page));
    userServiceSpy.getCustomers.mockReturnValue(of([user]));
    userServiceSpy.getAllDisableUsers.mockReturnValue(of([user]));
    userServiceSpy.getUser.mockReturnValue(of(user));
    userServiceSpy.getMyUser.mockReturnValue(of(user));
    userServiceSpy.getCustomerOverview.mockReturnValue(of(overview));

    store.loadPage({
      page: 1,
      sort: 'displayName',
      direction: 'asc',
      size: 25,
      filter: 'ann',
    });
    expect(store.data()).toEqual(page);

    store.loadCustomers();
    expect(store.customers()).toEqual([user]);

    store.loadDisabledUsers();
    expect(store.users()).toEqual([user]);

    store.loadById('user-1');
    expect(store.selected()).toEqual(user);

    store.loadMyUser();
    expect(store.selected()).toEqual(user);

    store.loadOverview('user-1');

    expect(userServiceSpy.getUsersPage).toHaveBeenCalledWith(
      1,
      'displayName',
      'asc',
      25,
      'ann',
    );
    expect(store.overview()).toEqual(overview);
    expect(store.isLoading()).toBe(false);
  });

  it('should expose response metadata for user mutations', () => {
    userServiceSpy.saveUser.mockReturnValue(
      of({
        key: 'USER.CUSTOMER',
        response: { id: 'user-2', name: 'New User' },
      }),
    );
    userServiceSpy.setRole.mockReturnValue(of(user));
    userServiceSpy.deleteUser.mockReturnValue(of(void 0));
    userServiceSpy.restore.mockReturnValue(
      of({ id: 'user-1', name: 'User One' }),
    );
    userServiceSpy.resendToken.mockReturnValue(of(void 0));
    userServiceSpy.mergeUsers.mockReturnValue(of(user));

    store.save({ displayName: 'New User' }, undefined, Role.customer);
    expect(store.response()).toEqual(
      expect.objectContaining({
        message: 'USER.CUSTOMER:New User',
        path: 'users/user-2',
        redirect: 'users',
      }),
    );

    store.setRole('user-1', 'User One', Role.admin, 'ADD');
    expect(store.response()).toEqual(
      expect.objectContaining({
        message: 'USER.ROLES.ADD:COMMON.ROLES.ROLE_ADMIN',
        path: 'users/user-1',
      }),
    );

    store.delete('user-1', 'User One');
    expect(store.response()).toEqual(
      expect.objectContaining({
        message: 'USER.DELETED.MESSAGE:User One',
        toastType: 'warning',
        reload: true,
      }),
    );

    store.restore('user-1', { deleted: false });
    expect(store.response()).toEqual(
      expect.objectContaining({
        message: 'USER.RESTORE.MESSAGE:User One',
      }),
    );

    store.resendToken('user-1');
    expect(store.response()).toEqual(
      expect.objectContaining({
        message: 'USER.ACTIVATION_RESEND.MESSAGE',
      }),
    );

    store.mergeUsers('old-user', 'new-user');
    expect(store.response()).toEqual(
      expect.objectContaining({
        message: 'USER.MERGE.SUCCESS',
      }),
    );
    expect(store.isLoading()).toBe(false);
  });

  it('should update profile data and dispatch login success', () => {
    const updatedUser: IUser = { locale: 'es', displayName: 'Updated User' };
    userServiceSpy.updateMyUser.mockReturnValue(of(token));

    store.updateMyUser(updatedUser, '/es/auth/profile', 'PROFILE.UPDATED');

    expect(userServiceSpy.updateMyUser).toHaveBeenCalledWith(updatedUser);
    expect(store.response()).toEqual({
      message: 'PROFILE.UPDATED',
      toastType: 'success',
    });
    expect(authStoreSpy.loginSuccess).toHaveBeenCalledWith(token, {
      state: btoa(
        JSON.stringify({ returnUrl: '/es/auth/profile', lang: 'es' }),
      ),
    });
  });

  it('should update profile photo and dispatch login success with current language', () => {
    userServiceSpy.updateMyPhoto.mockReturnValue(of(token));

    store.updateMyPhoto('data:image/jpeg;base64,AAA');

    expect(userServiceSpy.updateMyPhoto).toHaveBeenCalledWith(
      'data:image/jpeg;base64,AAA',
    );
    expect(store.response()).toEqual({
      message: 'COMMON.PROFILE.UPDATED.PHOTO',
      toastType: 'success',
    });
    expect(authStoreSpy.loginSuccess).toHaveBeenCalledWith(token, {
      state: btoa(
        JSON.stringify({
          returnUrl: `/${DEFAULT_LOCALE}/auth/profile`,
          lang: DEFAULT_LOCALE,
        }),
      ),
    });
  });

  it('should clear response, clear errors, and clean state', () => {
    userServiceSpy.saveUser.mockReturnValue(
      of({
        key: 'USER.CUSTOMER',
        response: { id: 'user-2', name: 'New User' },
      }),
    );

    store.save({ displayName: 'New User' }, undefined, Role.customer);
    store.clearResponse();
    store.clearError();
    store.clean();

    expect(store.response()).toBeUndefined();
    expect(store.error()).toBeUndefined();
    expect(store.subErrors()).toBeUndefined();
    expect(store.isLoading()).toBe(false);
  });

  it('should map service failures into error state', () => {
    userServiceSpy.getUser.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: {
              message: 'USER.INVALID',
              subErrors: [{ field: 'email', message: 'Invalid email' }],
            },
          }),
      ),
    );

    store.loadById('missing');

    expect(store.response()).toBeUndefined();
    expect(store.error()).toEqual(
      expect.objectContaining({
        message: 'USER.INVALID',
        subErrors: [{ field: 'email', message: 'Invalid email' }],
      }),
    );
    expect(store.subErrors()).toEqual([
      { field: 'email', message: 'Invalid email' },
    ]);
    expect(store.isLoading()).toBe(false);
  });
});
