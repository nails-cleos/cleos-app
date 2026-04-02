import { TestBed } from '@angular/core/testing';
import { HttpHandlerFn, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';

import { TokenService } from '../services/token.service';
import { requestOptionInterceptor } from './request-option-interceptor';

describe('requestOptionInterceptor', () => {
  let tokenServiceMock: {
    user: jasmine.Spy<() => { lang?: string } | null>;
  };

  const runInterceptor = async (req: HttpRequest<unknown>): Promise<HttpRequest<unknown>> => {
    let capturedRequest: HttpRequest<unknown> | undefined;
    const next: HttpHandlerFn = (request: HttpRequest<unknown>) => {
      capturedRequest = request;
      return of(new HttpResponse({ status: 200 }));
    };

    await firstValueFrom(TestBed.runInInjectionContext(() => requestOptionInterceptor(req, next)));

    expect(capturedRequest).toBeDefined();
    return capturedRequest as HttpRequest<unknown>;
  };

  beforeEach(() => {
    tokenServiceMock = {
      user: jasmine.createSpy('user').and.returnValue(null),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenService, useValue: tokenServiceMock as unknown as TokenService },
      ],
    });
  });

  it('should add default JSON and language headers for internal requests', async () => {
    tokenServiceMock.user.and.returnValue({ lang: 'nl' });
    const request = await runInterceptor(new HttpRequest('GET', 'v1/users/me'));

    expect(request.headers.get('Content-Type')).toBe('application/json');
    expect(request.headers.get('Accept')).toBe('application/json');
    expect(request.headers.get('Accept-Language')).toBe('nl');
  });

  it('should preserve provided headers and skip Content-Type when Upload header is present', async () => {
    tokenServiceMock.user.and.returnValue({ lang: undefined });
    const request = await runInterceptor(new HttpRequest('POST', 'v1/upload', null, {
      headers: new HttpHeaders({
        Upload: 'true',
        Accept: 'text/csv',
      }),
    }));

    expect(request.headers.has('Content-Type')).toBeFalse();
    expect(request.headers.get('Accept')).toBe('text/csv');
    expect(request.headers.has('Accept-Language')).toBeFalse();
  });

  it('should skip all header changes for external URLs', async () => {
    const external = 'https://maps.googleapis.com/maps/api/place';
    const request = await runInterceptor(new HttpRequest('GET', external));

    expect(request.url).toBe(external);
    expect(request.headers.has('Content-Type')).toBeFalse();
    expect(request.headers.has('Accept')).toBeFalse();
    expect(tokenServiceMock.user).not.toHaveBeenCalled();
  });
});
