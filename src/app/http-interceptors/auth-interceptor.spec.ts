import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';

import { TokenService } from '../services/token.service';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  let authMock: {
    authStateReady: jasmine.Spy<() => Promise<void>>;
    currentUser: Auth['currentUser'];
  };

  const runInterceptor = async (req: HttpRequest<unknown>): Promise<HttpRequest<unknown>> => {
    let capturedRequest: HttpRequest<unknown> | undefined;
    const next: HttpHandlerFn = (request: HttpRequest<unknown>) => {
      capturedRequest = request;
      return of(new HttpResponse({ status: 200 }));
    };

    await firstValueFrom(TestBed.runInInjectionContext(() => authInterceptor(req, next)));

    expect(capturedRequest).toBeDefined();
    return capturedRequest as HttpRequest<unknown>;
  };

  beforeEach(() => {
    tokenServiceSpy = jasmine.createSpyObj<TokenService>('TokenService', ['token', 'driveToken']);
    authMock = {
      authStateReady: jasmine.createSpy('authStateReady').and.resolveTo(),
      currentUser: null,
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: Auth, useValue: authMock as unknown as Auth },
      ],
    });
  });

  it('should attach token headers when token is already available', async () => {
    tokenServiceSpy.token.and.returnValue('cached-token');
    tokenServiceSpy.driveToken.and.returnValue('drive-token');

    const request = await runInterceptor(new HttpRequest('GET', '/v1/users/me'));

    expect(request.headers.get('X-Authorization-Firebase')).toBe('cached-token');
    expect(request.headers.get('X-Google-Drive-Token')).toBe('drive-token');
    expect(authMock.authStateReady).not.toHaveBeenCalled();
  });

  it('should wait auth restoration and use firebase token when startup token is empty', async () => {
    tokenServiceSpy.token.and.returnValue(null);
    tokenServiceSpy.driveToken.and.returnValue(undefined);
    authMock.currentUser = {
      getIdToken: jasmine.createSpy('getIdToken').and.resolveTo('restored-token'),
    } as unknown as Auth['currentUser'];

    const request = await runInterceptor(new HttpRequest('GET', '/v1/users/me'));

    expect(authMock.authStateReady).toHaveBeenCalled();
    expect(request.headers.get('X-Authorization-Firebase')).toBe('restored-token');
  });

  it('should continue without auth header when there is no restored user', async () => {
    tokenServiceSpy.token.and.returnValue(null);
    tokenServiceSpy.driveToken.and.returnValue(undefined);
    authMock.currentUser = null;

    const request = await runInterceptor(new HttpRequest('GET', '/v1/users/me'));

    expect(authMock.authStateReady).toHaveBeenCalled();
    expect(request.headers.has('X-Authorization-Firebase')).toBeFalse();
  });

  it('should skip auth restoration for login calls', async () => {
    tokenServiceSpy.token.and.returnValue(null);
    tokenServiceSpy.driveToken.and.returnValue(undefined);

    const request = await runInterceptor(new HttpRequest('POST', '/v1/auth/login', { body: { username: 'test', password: 'test' } }));

    expect(authMock.authStateReady).not.toHaveBeenCalled();
    expect(request.headers.has('X-Authorization-Firebase')).toBeFalse();
  });
});
