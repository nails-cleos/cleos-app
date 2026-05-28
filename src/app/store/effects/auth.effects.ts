import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { login, loginFailure, loginSuccess, logOut, redirect, reLogin } from '../auth.actions';
import { TranslateService } from '@ngx-translate/core';
import { NavigationService } from '../../services/navigation.service';
import { AuthUserService } from '../../services/auth-user.service';
import { getLocale } from '../../util/helper';
import { Token } from '../../interfaces/token';
import { FirebaseService } from '../../services/firebase.service';
import { effectRequest } from '../../util/rxjs';

@Injectable()
export class LoginEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly firebaseService = inject(FirebaseService);

  login$ = createEffect(() => this.actions.pipe(
    ofType(login),
    switchMap(({ token, code, theme, queryParams }) => effectRequest(
      this.authService.login(token, code, theme).pipe(map((token: Token) =>
        loginSuccess({ token, queryParams, redirect: true }))),
      action => action,
      loginFailure,
    )),
  ));

  loginSuccess$ = createEffect(() => this.actions.pipe(
    ofType(loginSuccess),
    tap(({ queryParams }) => {
      let redirectUrl = [this.translate.getCurrentLang(), 'auth', 'redirect'];
      if (Object.keys(queryParams).length) {
        const state = JSON.parse(atob(queryParams.state));
        const decodedURI = state.returnUrl;
        const paramsIndex = decodedURI.indexOf('?');
        if (paramsIndex > -1) {
          const queryString = decodedURI.slice(paramsIndex + 1);
          const queryParams = Object.fromEntries(new URLSearchParams(queryString).entries());
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

  logOut$ = createEffect(() => this.actions.pipe(
    ofType(logOut),
    tap(() => {
      this.firebaseService.signOut().then(() => {
        this.authUserService.reloadUser();
        localStorage.removeItem('auth');
        window.location.href = `/${getLocale(this.translate.getCurrentLang()).language}/home`;
      }).catch((error) => {
        console.error('sign out error: ' + error);
      });
    }),
  ), { dispatch: false });

  reLogin$ = createEffect(() => this.actions.pipe(
    ofType(reLogin),
    tap(() => {
      localStorage.removeItem('auth');
      window.location.href = this.router.url;
    }),
  ), { dispatch: false });

  redirect$ = createEffect(() => this.actions.pipe(
    ofType(redirect),
    tap(() => this.router.navigate([this.translate.getCurrentLang(), 'auth', 'redirect'])),
  ), { dispatch: false });
}
