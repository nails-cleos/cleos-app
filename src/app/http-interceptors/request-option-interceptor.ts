import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';
import { IUserAll } from '../interfaces/user';
import { isExternalUrl } from './index';

export const requestOptionInterceptor = (req: HttpRequest<unknown>,
                                         next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  if (!isExternalUrl(req.url)) {
    if (!req.headers.has('Content-Type') && !req.headers.has('Upload')) {
      req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
    }

    if (!req.headers.has('Accept')) {
      req = req.clone({ headers: req.headers.set('Accept', 'application/json') });
    }

    const user: IUserAll = inject(TokenService).user;
    if (user && user.lang) {
      req = req.clone({ headers: req.headers.set('Accept-Language', user.lang) });
    }
  }

  return next(req);
}
