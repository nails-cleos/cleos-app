import { TestBed } from '@angular/core/testing';
import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { TokenService } from '../services/token.service';
import { authInterceptor } from './auth-interceptor';
import { FirebaseService } from '../services/firebase.service';

describe('authInterceptor', () => {
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;

  let firebaseServiceSpy: jasmine.SpyObj<FirebaseService>;

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
    firebaseServiceSpy = jasmine.createSpyObj('FirebaseService', [
      'authStateReady',
      'getIdToken',
    ], {
      currentUser: null,
    });

    firebaseServiceSpy.authStateReady.and.resolveTo();
    firebaseServiceSpy.getIdToken.and.resolveTo(null);

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: FirebaseService, useValue: firebaseServiceSpy },
      ],
    });
  });

  it('should attach token headers when token is already available', async () => {
    tokenServiceSpy.token.and.returnValue('cached-token');
    tokenServiceSpy.driveToken.and.returnValue('drive-token');

    const request = await runInterceptor(new HttpRequest('GET', '/v1/users/me'));

    expect(request.headers.get('X-Authorization-Firebase')).toBe('cached-token');
    expect(request.headers.get('X-Google-Drive-Token')).toBe('drive-token');
    expect(firebaseServiceSpy.authStateReady).not.toHaveBeenCalled();
  });

  it('should wait auth restoration and use firebase token when startup token is empty', async () => {
    tokenServiceSpy.token.and.returnValues(null, 'restored-token');
    tokenServiceSpy.driveToken.and.returnValue(undefined);

    const request = await runInterceptor(new HttpRequest('GET', '/v1/users/me'));

    expect(firebaseServiceSpy.authStateReady).toHaveBeenCalled();
    expect(request.headers.get('X-Authorization-Firebase')).toBe('restored-token');
  });

  it('should continue without auth header when there is no restored user', async () => {
    tokenServiceSpy.token.and.returnValue(null);
    tokenServiceSpy.driveToken.and.returnValue(undefined);
    firebaseServiceSpy.getIdToken.and.resolveTo(null);

    const request = await runInterceptor(new HttpRequest('GET', '/v1/users/me'));

    expect(firebaseServiceSpy.authStateReady).toHaveBeenCalled();
    expect(firebaseServiceSpy.getIdToken).toHaveBeenCalled();
    expect(request.headers.has('X-Authorization-Firebase')).toBeFalse();
  });

  it('should skip auth restoration for login calls', async () => {
    tokenServiceSpy.token.and.returnValue(null);
    tokenServiceSpy.driveToken.and.returnValue(undefined);

    const request = await runInterceptor(
      new HttpRequest('POST', '/v1/auth/login', { body: { username: 'test', password: 'test' } }));

    expect(firebaseServiceSpy.authStateReady).not.toHaveBeenCalled();
    expect(request.headers.has('X-Authorization-Firebase')).toBeFalse();
  });

  it('should wait auth restoration and use firebase token when startup token is empty', async () => {
    tokenServiceSpy.token.and.returnValues(null, 'restored-token');
    tokenServiceSpy.driveToken.and.returnValue(undefined);

    firebaseServiceSpy.authStateReady.and.resolveTo();

    const request = await runInterceptor(new HttpRequest('GET', '/v1/users/me'));

    expect(firebaseServiceSpy.authStateReady).toHaveBeenCalled();
    expect(request.headers.get('X-Authorization-Firebase')).toBe('restored-token');
  });

  it('should use firebase id token when cache is still empty after auth restoration', async () => {
    tokenServiceSpy.token.and.returnValues(null, null);
    tokenServiceSpy.driveToken.and.returnValue('drive-token');
    firebaseServiceSpy.getIdToken.and.resolveTo('firebase-token');

    const request = await runInterceptor(new HttpRequest('GET', '/v1/users/me'));

    expect(request.headers.get('X-Authorization-Firebase')).toBe('firebase-token');
    expect(request.headers.get('X-Google-Drive-Token')).toBe('drive-token');
  });

  it('should continue without auth header when firebase token retrieval fails', async () => {
    tokenServiceSpy.token.and.returnValues(null, null);
    tokenServiceSpy.driveToken.and.returnValue(undefined);
    firebaseServiceSpy.getIdToken.and.rejectWith(new Error('boom'));

    const request = await runInterceptor(new HttpRequest('GET', '/v1/users/me'));

    expect(request.headers.has('X-Authorization-Firebase')).toBeFalse();
  });

  it('should continue without auth header when auth restoration fails', async () => {
    tokenServiceSpy.token.and.returnValue(null);
    tokenServiceSpy.driveToken.and.returnValue(undefined);
    firebaseServiceSpy.authStateReady.and.rejectWith(new Error('boom'));

    const request = await runInterceptor(new HttpRequest('GET', '/v1/users/me'));

    expect(request.headers.has('X-Authorization-Firebase')).toBeFalse();
  });
});
