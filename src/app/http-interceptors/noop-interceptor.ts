import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { isExternalUrl } from "./index";

@Injectable({ providedIn: 'root' })
export class NoopInterceptor implements HttpInterceptor {

  intercept = (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> => {
    if (!isExternalUrl(req.url)) {
      return next.handle(req.clone({ url: `${ environment.baseUrl }/${ req.url }` }));
    }
    return next.handle(req);
  }
}
