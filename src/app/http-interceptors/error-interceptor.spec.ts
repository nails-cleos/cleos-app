import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { firstValueFrom, throwError } from 'rxjs';

import { AuthUserService } from '../services/auth-user.service';
import { reLogin } from '../store/auth.actions';
import { errorInterceptor } from './error-interceptor';

describe('errorInterceptor', () => {
  let isAuthenticated = false;
  let authUserServiceMock: {
    authUser: jasmine.Spy<() => { isAuthenticated: boolean }>;
  };
  let storeSpy: jasmine.SpyObj<Store>;

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
    isAuthenticated = false;
    authUserServiceMock = {
      authUser: jasmine.createSpy('authUser').and.callFake(() => ({ isAuthenticated })),
    };
    storeSpy = jasmine.createSpyObj<Store>('Store', ['dispatch']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthUserService, useValue: authUserServiceMock as unknown as AuthUserService },
        { provide: Store, useValue: storeSpy },
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
    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  }));

  it('should dispatch reLogin on 401 when user is authenticated', async () => {
    isAuthenticated = true;
    const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const result = await runWithError(error);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(reLogin());
    expect(result).toBe(error);
  });

  it('should not dispatch reLogin on 401 when user is not authenticated', async () => {
    isAuthenticated = false;
    const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const result = await runWithError(error);

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
    expect(result).toBe(error);
  });

  it('should pass through non-network errors unchanged', async () => {
    const error = new HttpErrorResponse({ status: 400, statusText: 'Bad Request' });
    const result = await runWithError(error);

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
    expect(result).toBe(error);
  });
});
