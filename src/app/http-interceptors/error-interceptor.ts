import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, retry, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { reLogin } from '../store/auth.actions';

import { genericRetryStrategy } from '../util/rxjs';
import { AuthUserService } from '../services/auth-user.service';

export const errorInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthUserService);
  const store = inject(Store);

  return next(req).pipe(retry({
    count: 3,
    delay: genericRetryStrategy({}),
  }), catchError(err => {
    if ([0].indexOf(err.status) !== -1) {
      return throwError(() => ({
        ...err,
        error: {
          ...err?.error,
          status: 'SERVER_ERROR',
          message: 'COMMON.ERROR.TRY_LATER',
        },
      }));
    }
    if (err.status === 401) {
      if (authService.authUser().isAuthenticated) {
        store.dispatch(reLogin());
      } else {
        return throwError(() => err);
      }
    }

    return throwError(() => err);
  }));
};
