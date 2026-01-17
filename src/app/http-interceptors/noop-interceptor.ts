import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';
import { isExternalUrl } from './index';
import { EnvService } from '../services/env.service';
import { inject } from '@angular/core';

export const noopInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const env: EnvService = inject(EnvService);
  if (!isExternalUrl(req.url)) {
    return next(req.clone({ url: `${env.baseUrl}/${req.url}` }));
  }
  return next(req);
};
