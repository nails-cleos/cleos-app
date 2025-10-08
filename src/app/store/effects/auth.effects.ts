import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AuthActionTypes, Login, LoginFailure, LoginSuccess } from '../auth.actions';
import { TranslateService } from '@ngx-translate/core';
import { NavigationService } from '../../services/navigation.service';
import { AuthUserService } from '../../services/auth-user.service';
import { Auth, signOut } from '@angular/fire/auth';
import { getLocale } from '../../util/helper';
import { Token } from '../../interfaces/token';

@Injectable()
export class LoginEffects {

  login$ = createEffect(() => this.actions.pipe(
    ofType(AuthActionTypes.login),
    switchMap((action: Login) =>
      this.authService.login(action.token, action.code, action.theme).pipe(
        switchMap((token: Token) => of(new LoginSuccess(token, action.queryParams, true))),
        catchError((err: HttpErrorResponse) => of(new LoginFailure(err.error))),
      )),
  ));

  loginSuccess$ = createEffect(() => this.actions.pipe(ofType(AuthActionTypes.loginSuccess),
    tap((response: LoginSuccess) => {
      let redirectUrl = [this.translate.currentLang, 'auth', 'redirect'];
      if (Object.keys(response.queryParams).length) {
        const state = JSON.parse(atob(response.queryParams.state));
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

  logInFailure$ = createEffect(() => this.actions.pipe(ofType(AuthActionTypes.loginFailure),
  ), { dispatch: false });

  logOut$ = createEffect(() => this.actions.pipe(ofType(AuthActionTypes.logout),
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

  reLogin$ = createEffect(() => this.actions.pipe(ofType(AuthActionTypes.reLogin),
    tap(() => {
      localStorage.removeItem('auth');
      window.location.href = `/${ this.translate.currentLang }/auth`;
    }),
  ), { dispatch: false });

  redirect$ = createEffect(() => this.actions.pipe(ofType(AuthActionTypes.redirect),
    tap(() => this.router.navigate([this.translate.currentLang, 'auth', 'redirect'])),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions, private authService: AuthService,
              private router: Router, private navigationService: NavigationService, @Optional() private auth: Auth,
              private authUserService: AuthUserService) {
  }
}
