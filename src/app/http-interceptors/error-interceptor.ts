import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retryWhen } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.states';
import * as fromActionsLogin from '../store/auth.actions';

import { genericRetryStrategy } from '../util/rxjs';
import { AuthUserService } from '../services/auth-user.service';

@Injectable({ providedIn: 'root' })
export class ErrorInterceptor implements HttpInterceptor {

  isAuthenticated = false;

  constructor(private store: Store<AppState>, private authUserService: AuthUserService) {
    this.authUserService.authUser.subscribe(value => this.isAuthenticated = value.isAuthenticated);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(retryWhen(genericRetryStrategy({
      excludedStatusCodes: [0, 400, 401, 403, 500]
    })), catchError(err => {
      if ([0].indexOf(err.status) !== -1) {
        const message = err?.error?.message || err.statusText;
        return throwError({ error: { message } });
      }
      if ([401].indexOf(err.status) >= 0 && this.isAuthenticated) {
        this.store.dispatch(
          new fromActionsLogin.ReLogin()
        );
      }
      return throwError(err);
    }));
  }
}
