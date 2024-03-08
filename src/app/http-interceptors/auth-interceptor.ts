import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';
import { isExternalUrl } from './index';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {

  constructor(private tokenService: TokenService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!isExternalUrl(req.url) && this.tokenService.token) {
      req = req.clone({
        setHeaders: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'X-Authorization-Firebase': this.tokenService.token
        }
      });
    }

    return next.handle(req);
  }
}
