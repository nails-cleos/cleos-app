import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, retry, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.states';
import * as fromActionsLogin from '../store/auth.actions';

import { genericRetryStrategy } from '../util/rxjs';
import { AuthUserService } from '../services/auth-user.service';

export const errorInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthUserService);
  const store = inject(Store<AppState>);
  return next(req).pipe(retry({
    count: 3,
    delay: genericRetryStrategy({}),
  }), catchError(err => {
    if ([0].indexOf(err.status) !== -1) {
      const message = err?.error?.message || err.statusText;
      return throwError(() => ({ error: { message } }));
    }
    if (err.status === 401) {
      return authService.authUser.pipe(
        switchMap(value => {
          if (value.isAuthenticated) {
            store.dispatch(new fromActionsLogin.ReLogin());
          }
          return throwError(err);
        }),
      );
    }

    return throwError(err);
  }));
};
