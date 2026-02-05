import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';
import { isExternalUrl } from './index';

export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const tokenService = inject(TokenService);

  if (!isExternalUrl(req.url) && !req.url.includes('login')) {
    const token = tokenService.token();
    const driveToken= tokenService.driveToken();
    if (token) {
      req = req.clone({
        setHeaders: {
          'X-Authorization-Firebase': token,
          ...(driveToken && { 'X-Google-Drive-Token': driveToken }),
        },
      });
      return next(req);
    }
  }

  return next(req);
};
