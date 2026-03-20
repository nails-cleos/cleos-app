import { TestBed } from '@angular/core/testing';
import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';

import { EnvService } from '../services/env.service';
import { noopInterceptor } from './noop-interceptor';

describe('noopInterceptor', () => {
  const envMock = {
    baseUrl: 'https://api.example.com',
  } as EnvService;

  const runInterceptor = async (req: HttpRequest<unknown>): Promise<HttpRequest<unknown>> => {
    let capturedRequest: HttpRequest<unknown> | undefined;
    const next: HttpHandlerFn = (request: HttpRequest<unknown>) => {
      capturedRequest = request;
      return of(new HttpResponse({ status: 200 }));
    };

    await firstValueFrom(TestBed.runInInjectionContext(() => noopInterceptor(req, next)));

    expect(capturedRequest).toBeDefined();
    return capturedRequest as HttpRequest<unknown>;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: EnvService, useValue: envMock },
      ],
    });
  });

  it('should prepend baseUrl for internal routes', async () => {
    const request = await runInterceptor(new HttpRequest('GET', 'v1/users/me'));
    expect(request.url).toBe('https://api.example.com/v1/users/me');
  });

  it('should keep external URLs unchanged', async () => {
    const external = 'https://maps.googleapis.com/maps/api/geocode/json';
    const request = await runInterceptor(new HttpRequest('GET', external));
    expect(request.url).toBe(external);
  });
});
