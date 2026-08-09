import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { firstValueFrom, of, throwError } from 'rxjs';

import { loadingInterceptor } from './loading-interceptor';
import { LoadingOverlayService } from '../services/loading-overlay.service';
describe('loadingInterceptor', () => {
  let loadingOverlayServiceSpy: {
    show: Mock;
    hide: Mock;
  };

  beforeEach(() => {
    loadingOverlayServiceSpy = {
      show: vi.fn().mockName('LoadingOverlayService.show'),
      hide: vi.fn().mockName('LoadingOverlayService.hide'),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: LoadingOverlayService, useValue: loadingOverlayServiceSpy },
      ],
    });
  });

  it('should show and hide the loading overlay for internal requests', async () => {
    const next: HttpHandlerFn = (request: HttpRequest<unknown>) => {
      expect(request.url).toBe('/v1/users/me');
      return of(new HttpResponse({ status: 200 }));
    };

    await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        loadingInterceptor(new HttpRequest('GET', '/v1/users/me'), next),
      ),
    );

    expect(loadingOverlayServiceSpy.show).toHaveBeenCalled();
    expect(loadingOverlayServiceSpy.hide).toHaveBeenCalled();
  });

  it('should hide the loading overlay when an internal request errors', async () => {
    const next: HttpHandlerFn = () =>
      throwError(() => new HttpErrorResponse({ status: 500 }));

    await expect(
      firstValueFrom(
        TestBed.runInInjectionContext(() =>
          loadingInterceptor(new HttpRequest('GET', '/v1/users/me'), next),
        ),
      ),
    ).rejects.toThrow();

    expect(loadingOverlayServiceSpy.show).toHaveBeenCalled();
    expect(loadingOverlayServiceSpy.hide).toHaveBeenCalled();
  });

  it('should skip the loading overlay for external requests', async () => {
    const next: HttpHandlerFn = () => of(new HttpResponse({ status: 200 }));

    await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        loadingInterceptor(
          new HttpRequest('GET', 'https://maps.googleapis.com/maps/api/place'),
          next,
        ),
      ),
    );

    expect(loadingOverlayServiceSpy.show).not.toHaveBeenCalled();
    expect(loadingOverlayServiceSpy.hide).not.toHaveBeenCalled();
  });
});
