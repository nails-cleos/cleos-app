import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AuthActionTypes, LoginFailure, LoginSuccess, SignUpFailure, SignUpSuccess } from '../auth.actions';
import { TranslateService } from '@ngx-translate/core';
import { NavigationService } from '../../services/navigation.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable()
export class LoginEffects {

  login$ = createEffect(() => this.actions$.pipe(ofType(AuthActionTypes.login)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.authService.login(payload.username, payload.password).pipe(
      switchMap((response: any) => of(new LoginSuccess({
        response,
        queryParams: payload.queryParams
      }))),
      catchError((err: HttpErrorResponse) => of(new LoginFailure({ error: err.error })))
    ))
  ));

  socialLogin$ = createEffect(() => this.actions$.pipe(ofType(AuthActionTypes.socialLogin)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      const user = payload.socialUser;
      return this.authService.socialLogin(user.idToken || user.authToken, user.provider, payload.code,
        payload.theme).pipe(switchMap((response: any) => of(new LoginSuccess({
          response,
          queryParams: payload.queryParams
        }))),
        catchError((err: HttpErrorResponse) => of(new LoginFailure({ error: err.error })))
      );
    })
  ));

  signUp$ = createEffect(() => this.actions$.pipe(ofType(AuthActionTypes.signup)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.authService.signUp(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('AUTH.SIGN_UP.SUCCESS', {
          username: response.username,
          email: response.email
        });
        return of(new SignUpSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new SignUpFailure({ error: err.error })))
    ))
  ));

  activateAccount$ = createEffect(() => this.actions$.pipe(ofType(AuthActionTypes.activateAccount)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.authService.activateAccount(payload).pipe(
      switchMap(() => {
        const message = this.translate.instant('AUTH.ACTIVATE_ACCOUNT.MESSAGE');
        return of(new SignUpSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new SignUpFailure({ error: err.error })))
    ))
  ));

  forgotPassword$ = createEffect(() => this.actions$.pipe(ofType(AuthActionTypes.forgotPassword)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.authService.forgotPassword(payload).pipe(
      switchMap(() => {
        const message = this.translate.instant('AUTH.FORGOT_PASSWORD.MESSAGE');
        return of(new SignUpSuccess({ message }));
      }),
      catchError((err: HttpErrorResponse) => of(new SignUpFailure({ error: err.error })))
    ))
  ));

  recoveryPassword$ = createEffect(() => this.actions$.pipe(ofType(AuthActionTypes.recoveryPassword)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.authService.recoveryPassword(payload.token, payload.password).pipe(
      switchMap(() => {
        const message = this.translate.instant('AUTH.RECOVERY_PASSWORD.MESSAGE');
        return of(new SignUpSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new SignUpFailure({ error: err.error })))
    ))
  ));

  loginSuccess$ = createEffect(() => this.actions$.pipe(ofType(AuthActionTypes.loginSuccess),
    tap((response: any) => {
      if (Object.keys(response.payload.queryParams).length) {
        const state = JSON.parse(atob(response.payload.queryParams.state));
        const decodedURI = state.returnUrl;
        const paramsIndex = decodedURI.indexOf('?');
        if (paramsIndex > -1) {
          const queryParams = JSON.parse('{"' + decodeURI(decodedURI?.slice(paramsIndex + 1)
            ?.replace(/&/g, '","')?.replace(/=/g, '":"')) + '"}');
          this.navigationService.reload(decodedURI?.slice(0, paramsIndex)?.split('/'), state.data, queryParams);
        } else {
          const redirectUrl = decodedURI?.split('/') || ['auth', 'redirect'];
          this.navigationService.reload(redirectUrl, state.data);
        }
      } else {
        this.navigationService.reload(['auth', 'redirect']);
      }
    })
  ), { dispatch: false });

  logInFailure$ = createEffect(() => this.actions$.pipe(ofType(AuthActionTypes.loginFailure)
  ), { dispatch: false });

  signUpSuccess$ = createEffect(() => this.actions$.pipe(ofType(AuthActionTypes.signupSuccess)
  ), { dispatch: false });

  signUpFailure$ = createEffect(() => this.actions$.pipe(ofType(AuthActionTypes.signupFailure)
  ), { dispatch: false });

  logOut$ = createEffect(() => this.actions$.pipe(ofType(AuthActionTypes.logout),
    tap(() => {
      this.auth.signOut();
      localStorage.removeItem('auth');
      window.location.href = '/main';
    })
  ), { dispatch: false });

  reLogin$ = createEffect(() => this.actions$.pipe(ofType(AuthActionTypes.reLogin),
    tap(() => {
      localStorage.removeItem('auth');
      window.location.href = '/auth';
    })
  ), { dispatch: false });

  redirect$ = createEffect(() => this.actions$.pipe(ofType(AuthActionTypes.redirect),
    tap(() => this.router.navigate(['auth', 'redirect']))
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions$: Actions, private authService: AuthService,
              private router: Router, private navigationService: NavigationService, private auth: AngularFireAuth) {
  }
}
