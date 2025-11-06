import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { login, loginFailure, loginSuccess, logOut, redirect, reLogin } from '../auth.actions';
import { TranslateService } from '@ngx-translate/core';
import { NavigationService } from '../../services/navigation.service';
import { AuthUserService } from '../../services/auth-user.service';
import { Auth, signOut } from '@angular/fire/auth';
import { getLocale } from '../../util/helper';
import { Token } from '../../interfaces/token';

@Injectable()
export class LoginEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly auth: Auth = inject(Auth);
  private readonly authUserService: AuthUserService = inject(AuthUserService);

  login$ = createEffect(() => this.actions.pipe(
    ofType(login),
    switchMap(({ token, code, theme, queryParams }) =>
      this.authService.login(token, code, theme).pipe(
        map((token: Token) => loginSuccess({ token, queryParams, redirect: true })),
        catchError((err: HttpErrorResponse) => of(loginFailure({ error: err.error }))),
      )),
  ));

  loginSuccess$ = createEffect(() => this.actions.pipe(
    ofType(loginSuccess),
    tap(({ queryParams }) => {
      let redirectUrl = [this.translate.currentLang, 'auth', 'redirect'];
      if (Object.keys(queryParams).length) {
        const state = JSON.parse(atob(queryParams.state));
        const decodedURI = state.returnUrl;
        const paramsIndex = decodedURI.indexOf('?');
        if (paramsIndex > -1) {
          const queryParams = JSON.parse('{"' + decodeURI(decodedURI?.slice(paramsIndex + 1)
            ?.replace(/&/g, '","')?.replace(/=/g, '":"')) + '"}');
          this.navigationService.reload(decodedURI?.slice(0, paramsIndex)?.split('/'), state.data, queryParams);
        } else {
          if (decodedURI) {
            const [, ...rest] = decodedURI.split('/');
            redirectUrl = ['/', ...rest];
          }
          this.navigationService.reload(redirectUrl, state.data, undefined, undefined, state.lang);
        }
      } else {
        this.navigationService.reload(redirectUrl);
      }
    }),
  ), { dispatch: false });

  logInFailure$ = createEffect(() => this.actions.pipe(
    ofType(loginFailure),
  ), { dispatch: false });

  logOut$ = createEffect(() => this.actions.pipe(
    ofType(logOut),
    tap(() => {
      signOut(this.auth).then(() => {
        this.authUserService.reloadUser();
        localStorage.removeItem('auth');
        window.location.href = `/${ getLocale(this.translate.currentLang).language }/home`;
      }).catch((error) => {
        console.error('sign out error: ' + error);
      });
    }),
  ), { dispatch: false });

  reLogin$ = createEffect(() => this.actions.pipe(
    ofType(reLogin),
    tap(() => {
      localStorage.removeItem('auth');
      window.location.href = `/${ this.translate.currentLang }/auth`;
    }),
  ), { dispatch: false });

  redirect$ = createEffect(() => this.actions.pipe(
    ofType(redirect),
    tap(() => this.router.navigate([this.translate.currentLang, 'auth', 'redirect'])),
  ), { dispatch: false });
}
