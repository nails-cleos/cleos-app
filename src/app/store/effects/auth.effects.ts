import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AuthActionTypes, LoginFailure, LoginSuccess, SignUpFailure, SignUpSuccess } from '../auth.actions';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class LoginEffects {

  @Effect()
  login$ = this.actions$.pipe(ofType(AuthActionTypes.login)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.authService.login(payload.username, payload.password).pipe(
      switchMap((response: any) => of(new LoginSuccess({
        response, queryParams: payload.queryParams,
        extras: payload.extras
      }))),
      catchError((err: HttpErrorResponse) => of(new LoginFailure({error: err.error})))
    ))
  );

  @Effect()
  socialLogin$ = this.actions$.pipe(ofType(AuthActionTypes.socialLogin)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      const user = payload.socialUser;
      return this.authService.socialLogin(user.idToken || user.authToken, user.provider, payload.code).pipe(
        switchMap((response: any) => of(new LoginSuccess({
          response,
          queryParams: payload.queryParams,
          extras: payload.extras
        }))),
        catchError((err: HttpErrorResponse) => of(new LoginFailure({error: err.error})))
      );
    })
  );

  @Effect()
  signUp$ = this.actions$.pipe(ofType(AuthActionTypes.signup)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.authService.signUp(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('AUTH.SIGN_UP.SUCCESS', {
          username: response.username,
          email: response.email
        });
        return of(new SignUpSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new SignUpFailure({error: err.error})))
    ))
  );

  @Effect()
  activateAccount$ = this.actions$.pipe(ofType(AuthActionTypes.activateAccount)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.authService.activateAccount(payload).pipe(
      switchMap(() => {
        const message = this.translate.instant('AUTH.ACTIVATE_ACCOUNT.MESSAGE');
        return of(new SignUpSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new SignUpFailure({error: err.error})))
    ))
  );

  @Effect()
  forgotPassword$ = this.actions$.pipe(ofType(AuthActionTypes.forgotPassword)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.authService.forgotPassword(payload).pipe(
      switchMap(() => {
        const message = this.translate.instant('AUTH.FORGOT_PASSWORD.MESSAGE');
        return of(new SignUpSuccess({message}));
      }),
      catchError((err: HttpErrorResponse) => of(new SignUpFailure({error: err.error})))
    ))
  );

  @Effect()
  recoveryPassword$ = this.actions$.pipe(ofType(AuthActionTypes.recoveryPassword)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.authService.recoveryPassword(payload.token, payload.password).pipe(
      switchMap(() => {
        const message = this.translate.instant('AUTH.RECOVERY_PASSWORD.MESSAGE');
        return of(new SignUpSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new SignUpFailure({error: err.error})))
    ))
  );

  @Effect({dispatch: false})
  loginSuccess$ = this.actions$.pipe(
    ofType(AuthActionTypes.loginSuccess),
    tap((response: any) => {
      const redirectUrl = response.payload.response.user.changePassword
        ? ['change-password']
        : response.payload.queryParams.returnUrl || ['auth', 'redirect'];
      this.router.navigate(redirectUrl, {state: response.payload.extras});
    })
  );

  @Effect({dispatch: false})
  logInFailure$ = this.actions$.pipe(
    ofType(AuthActionTypes.loginFailure)
  );

  @Effect({dispatch: false})
  signUpSuccess$ = this.actions$.pipe(
    ofType(AuthActionTypes.signupSuccess)
  );

  @Effect({dispatch: false})
  signUpFailure$ = this.actions$.pipe(
    ofType(AuthActionTypes.signupFailure)
  );

  @Effect({dispatch: false})
  public logOut$ = this.actions$.pipe(
    ofType(AuthActionTypes.logout),
    tap(() => {
      localStorage.removeItem('auth');
      window.location.href = '/main';
    })
  );

  @Effect({dispatch: false})
  public reLogin$ = this.actions$.pipe(
    ofType(AuthActionTypes.reLogin),
    tap(() => {
      localStorage.removeItem('auth');
      window.location.href = '/auth';
    })
  );

  constructor(private readonly translate: TranslateService, private actions$: Actions, private authService: AuthService,
              private router: Router) {
  }
}
