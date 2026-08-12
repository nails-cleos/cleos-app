import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { isExternalUrl } from './index';
import { FirebaseService } from '../services/firebase.service';

const withAuthHeaders = (
  req: HttpRequest<unknown>,
  token: string,
  driveToken?: string,
): HttpRequest<unknown> =>
  req.clone({
    setHeaders: {
      'X-Authorization-Firebase': token,
      ...(driveToken && { 'X-Google-Drive-Token': driveToken }),
    },
  });

export const authInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const tokenService = inject(TokenService);
  const firebaseService = inject(FirebaseService);

  if (isExternalUrl(req.url) || req.url.includes('login')) {
    return next(req);
  }

  const token = tokenService.token();
  if (token) {
    return next(withAuthHeaders(req, token, tokenService.driveToken()));
  }

  return from(firebaseService.authStateReady()).pipe(
    switchMap(() => {
      const restoredToken = tokenService.token();
      if (restoredToken) {
        return next(
          withAuthHeaders(req, restoredToken, tokenService.driveToken()),
        );
      }

      return from(firebaseService.getIdToken()).pipe(
        switchMap((idToken) => {
          if (!idToken) {
            return next(req);
          }

          return next(withAuthHeaders(req, idToken, tokenService.driveToken()));
        }),
        catchError(() => next(req)),
      );
    }),
    catchError(() => next(req)),
  );
};
