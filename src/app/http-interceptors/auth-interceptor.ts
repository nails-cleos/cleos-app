import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {

  constructor(private tokenService: TokenService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.includes('maps.googleapis.com') && this.tokenService.user && this.tokenService.token) {
      req = req.clone({
        setHeaders: {
          authorization: this.tokenService.createTokenHeader()
        }
      });
    }

    return next.handle(req);
  }
}
