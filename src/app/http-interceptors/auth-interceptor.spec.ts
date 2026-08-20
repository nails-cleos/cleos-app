import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { TokenService } from '../services/token.service';
import { authInterceptor } from './auth-interceptor';
import { FirebaseService } from '../services/firebase.service';
describe('authInterceptor', () => {
  let tokenServiceSpy: {
    token: Mock;
    driveToken: Mock;
  };
  let firebaseServiceSpy: {
    authStateReady: Mock;
    getIdToken: Mock;
    currentUser: null;
  };

  const runInterceptor = async (
    req: HttpRequest<unknown>,
  ): Promise<HttpRequest<unknown>> => {
    let capturedRequest: HttpRequest<unknown> | undefined;
    const next: HttpHandlerFn = (request: HttpRequest<unknown>) => {
      capturedRequest = request;
      return of(new HttpResponse({ status: 200 }));
    };

    await firstValueFrom(
      TestBed.runInInjectionContext(() => authInterceptor(req, next)),
    );

    expect(capturedRequest).toBeDefined();
    return capturedRequest as HttpRequest<unknown>;
  };

  beforeEach(() => {
    tokenServiceSpy = {
      token: vi.fn().mockName('TokenService.token'),
      driveToken: vi.fn().mockName('TokenService.driveToken'),
    };
    firebaseServiceSpy = {
      authStateReady: vi.fn().mockName('FirebaseService.authStateReady'),
      getIdToken: vi.fn().mockName('FirebaseService.getIdToken'),
      currentUser: null,
    };

    firebaseServiceSpy.authStateReady.mockResolvedValue(undefined);
    firebaseServiceSpy.getIdToken.mockResolvedValue(null);

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: FirebaseService, useValue: firebaseServiceSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    });
  });

  it('should attach token headers when token is already available', async () => {
    tokenServiceSpy.token.mockReturnValue('cached-token');
    tokenServiceSpy.driveToken.mockReturnValue('drive-token');

    const request = await runInterceptor(
      new HttpRequest('GET', '/v1/users/me'),
    );

    expect(request.headers.get('X-Authorization-Firebase')).toBe(
      'cached-token',
    );
    expect(request.headers.get('X-Google-Drive-Token')).toBe('drive-token');
    expect(firebaseServiceSpy.authStateReady).not.toHaveBeenCalled();
  });

  it('should wait auth restoration and use firebase token when startup token is empty', async () => {
    tokenServiceSpy.token
      .mockReturnValueOnce(null)
      .mockReturnValueOnce('restored-token');
    tokenServiceSpy.driveToken.mockReturnValue(undefined);

    const request = await runInterceptor(
      new HttpRequest('GET', '/v1/users/me'),
    );

    expect(firebaseServiceSpy.authStateReady).toHaveBeenCalled();
    expect(request.headers.get('X-Authorization-Firebase')).toBe(
      'restored-token',
    );
  });

  it('should continue without auth header when there is no restored user', async () => {
    tokenServiceSpy.token.mockReturnValue(null);
    tokenServiceSpy.driveToken.mockReturnValue(undefined);
    firebaseServiceSpy.getIdToken.mockResolvedValue(null);

    const request = await runInterceptor(
      new HttpRequest('GET', '/v1/users/me'),
    );

    expect(firebaseServiceSpy.authStateReady).toHaveBeenCalled();
    expect(firebaseServiceSpy.getIdToken).toHaveBeenCalled();
    expect(request.headers.has('X-Authorization-Firebase')).toBe(false);
  });

  it('should skip auth restoration for login calls', async () => {
    tokenServiceSpy.token.mockReturnValue(null);
    tokenServiceSpy.driveToken.mockReturnValue(undefined);

    const request = await runInterceptor(
      new HttpRequest('POST', '/v1/auth/login', {
        body: { username: 'test', password: 'test' },
      }),
    );

    expect(firebaseServiceSpy.authStateReady).not.toHaveBeenCalled();
    expect(request.headers.has('X-Authorization-Firebase')).toBe(false);
  });

  it('should wait auth restoration and use firebase token when startup token is empty', async () => {
    tokenServiceSpy.token
      .mockReturnValueOnce(null)
      .mockReturnValueOnce('restored-token');
    tokenServiceSpy.driveToken.mockReturnValue(undefined);

    firebaseServiceSpy.authStateReady.mockResolvedValue(undefined);

    const request = await runInterceptor(
      new HttpRequest('GET', '/v1/users/me'),
    );

    expect(firebaseServiceSpy.authStateReady).toHaveBeenCalled();
    expect(request.headers.get('X-Authorization-Firebase')).toBe(
      'restored-token',
    );
  });

  it('should use firebase id token when cache is still empty after auth restoration', async () => {
    tokenServiceSpy.token.mockReturnValueOnce(null).mockReturnValueOnce(null);
    tokenServiceSpy.driveToken.mockReturnValue('drive-token');
    firebaseServiceSpy.getIdToken.mockResolvedValue('firebase-token');

    const request = await runInterceptor(
      new HttpRequest('GET', '/v1/users/me'),
    );

    expect(request.headers.get('X-Authorization-Firebase')).toBe(
      'firebase-token',
    );
    expect(request.headers.get('X-Google-Drive-Token')).toBe('drive-token');
  });

  it('should continue without auth header when firebase token retrieval fails', async () => {
    tokenServiceSpy.token.mockReturnValueOnce(null).mockReturnValueOnce(null);
    tokenServiceSpy.driveToken.mockReturnValue(undefined);
    firebaseServiceSpy.getIdToken.mockRejectedValue(new Error('boom'));

    const request = await runInterceptor(
      new HttpRequest('GET', '/v1/users/me'),
    );

    expect(request.headers.has('X-Authorization-Firebase')).toBe(false);
  });

  it('should continue without auth header when auth restoration fails', async () => {
    tokenServiceSpy.token.mockReturnValue(null);
    tokenServiceSpy.driveToken.mockReturnValue(undefined);
    firebaseServiceSpy.authStateReady.mockRejectedValue(new Error('boom'));

    const request = await runInterceptor(
      new HttpRequest('GET', '/v1/users/me'),
    );

    expect(request.headers.has('X-Authorization-Firebase')).toBe(false);
  });
});
