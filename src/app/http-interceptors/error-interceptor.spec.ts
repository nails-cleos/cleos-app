import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { firstValueFrom, throwError } from 'rxjs';

import { AuthUserService } from '../services/auth-user.service';
import { errorInterceptor } from './error-interceptor';
import { AuthStore } from '../store/auth.store';

describe('errorInterceptor', () => {
  let isAuthenticated = false;
  let authUserServiceMock: {
    authUser: jasmine.Spy<() => { isAuthenticated: boolean }>;
  };

  let authStoreSpy: {
    reLogin: jasmine.Spy;
  };

  const runWithError = async (error: unknown): Promise<unknown> => {
    const req = new HttpRequest('GET', '/v1/test');
    const next: HttpHandlerFn = () => throwError(() => error);

    try {
      await firstValueFrom(TestBed.runInInjectionContext(() => errorInterceptor(req, next)));
      return undefined;
    } catch (err) {
      return err;
    }
  };

  beforeEach(() => {
    authStoreSpy = {
      reLogin: jasmine.createSpy('reLogin'),
    };
    isAuthenticated = false;
    authUserServiceMock = {
      authUser: jasmine.createSpy('authUser').and.callFake(() => ({ isAuthenticated })),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthUserService, useValue: authUserServiceMock as unknown as AuthUserService },
        { provide: AuthStore, useValue: authStoreSpy },
      ],
    });
  });

  it('should map network error status 0 to a normalized message payload', fakeAsync(() => {
    const error = { status: 0, statusText: 'Offline', error: { message: 'Network unavailable' } };
    const req = new HttpRequest('GET', '/v1/test');
    const next: HttpHandlerFn = () => throwError(() => error);
    let result: unknown;
    let completed = false;

    TestBed.runInInjectionContext(() => errorInterceptor(req, next)).subscribe({
      next: () => fail('Expected interceptor to error'),
      error: err => {
        result = err;
        completed = true;
      },
    });

    tick(9001);
    flushMicrotasks();

    expect(result).toEqual({
      status: 0,
      statusText: 'Offline',
      error: {
        message: 'COMMON.ERROR.TRY_LATER',
        status: 'SERVER_ERROR',
      },
    });
    expect(completed).toBeTrue();
    expect(authStoreSpy.reLogin).not.toHaveBeenCalled();
  }));

  it('should dispatch reLogin on 401 when user is authenticated', async () => {
    isAuthenticated = true;
    const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const result = await runWithError(error);

    expect(authStoreSpy.reLogin).toHaveBeenCalled();
    expect(result).toBe(error);
  });

  it('should not dispatch reLogin on 401 when user is not authenticated', async () => {
    isAuthenticated = false;
    const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const result = await runWithError(error);

    expect(authStoreSpy.reLogin).not.toHaveBeenCalled();
    expect(result).toBe(error);
  });

  it('should pass through non-network errors unchanged', async () => {
    const error = new HttpErrorResponse({ status: 400, statusText: 'Bad Request' });
    const result = await runWithError(error);

    expect(authStoreSpy.reLogin).not.toHaveBeenCalled();
    expect(result).toBe(error);
  });
});
