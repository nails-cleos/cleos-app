import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { isExternalUrl } from './index';
import { LoadingOverlayService } from '../services/loading-overlay.service';
import { SKIP_LOADING_OVERLAY } from '../interfaces/pagination';

export const loadingInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  if (isExternalUrl(req.url) || req.context.get(SKIP_LOADING_OVERLAY)) {
    return next(req);
  }

  const loadingOverlayService = inject(LoadingOverlayService);
  loadingOverlayService.show();

  return next(req).pipe(
    finalize(() => loadingOverlayService.hide()),
  );
};
