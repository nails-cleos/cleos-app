import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class NoopInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.indexOf('i18n') === -1) {
      req = req.clone({url: `${environment.baseUrl}/${req.url}`});
    } else {
      const match = req.url.match(/([-_])/);
      const url = !match ? req.url : `${req.url.substr(0, match.index)}.json`;
      req = req.clone({url});
    }

    return next.handle(req);
  }
}
