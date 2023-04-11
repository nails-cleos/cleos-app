import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';
import { IUserAll } from '../interfaces/user';
import { isExternalUrl } from "./index";

@Injectable()
export class RequestOptionInterceptor implements HttpInterceptor {

  constructor(private tokenService: TokenService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!isExternalUrl(req.url)) {
      if (!req.headers.has('Content-Type') && !req.headers.has('Upload')) {
        req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
      }

      if (!req.headers.has('Accept')) {
        req = req.clone({ headers: req.headers.set('Accept', 'application/json') });
      }

      const user: IUserAll = this.tokenService.user;
      if (user && user.lang) {
        req = req.clone({ headers: req.headers.set('Accept-Language', user.lang) });
      }
    }

    return next.handle(req);
  }
}
