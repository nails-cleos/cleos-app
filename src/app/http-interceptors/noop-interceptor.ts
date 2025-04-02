import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { isExternalUrl } from './index';

export const noopInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  if (!isExternalUrl(req.url)) {
    return next(req.clone({ url: `${ environment.baseUrl }/${ req.url }` }));
  }
  return next(req);
};
