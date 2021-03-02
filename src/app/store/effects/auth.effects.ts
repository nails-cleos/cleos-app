import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AuthActionTypes, LoginFailure, LoginSuccess, SignUpFailure, SignUpSuccess } from '../auth.actions';
import { TranslateService } from '@ngx-translate/core';
import { Role } from '../../interfaces/token';

@Injectable()
export class LoginEffects {

  @Effect()
  login$ = this.actions$.pipe(ofType(AuthActionTypes.LOGIN)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.authService.login(payload.username, payload.password).pipe(
        switchMap((response: any) => {
          return of(new LoginSuccess({response, queryParams: payload.queryParams}));
        }),
        catchError((err: HttpErrorResponse) => of(new LoginFailure({error: err.error})))
      );
    })
  );

  @Effect()
  socialLogin$ = this.actions$.pipe(ofType(AuthActionTypes.SOCIAL_LOGIN)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      const user = payload.socialUser;
      return this.authService.socialLogin(user.idToken || user.authToken, user.provider).pipe(
        switchMap((response: any) => {
          return of(new LoginSuccess({response, queryParams: payload.queryParams}));
        }),
        catchError((err: HttpErrorResponse) => of(new LoginFailure({error: err.error})))
      );
    })
  );

  @Effect({dispatch: false})
  loginSuccess$ = this.actions$.pipe(
    ofType(AuthActionTypes.LOGIN_SUCCESS),
    tap((response: any) => {
      const roles = [Role.Admin, Role.Professional];
      const dash = response.payload.response.user.authorities.some((au: any) => roles.includes(au.authority)) ? 'dashboard' : 'main';
      const redirectUrl = response.payload.response.user.changePassword
        ? 'change-password'
        : response.payload.queryParams.returnUrl || dash;
      this.router.navigate([redirectUrl]);
    })
  );

  @Effect({dispatch: false})
  logInFailure$ = this.actions$.pipe(
    ofType(AuthActionTypes.LOGIN_FAILURE)
  );

  @Effect()
  signUp$ = this.actions$.pipe(ofType(AuthActionTypes.SIGNUP)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.authService.signUp(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('AUTH.SIGN_UP.SUCCESS', {username: response.username, email: response.email});
          return of(new SignUpSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new SignUpFailure({error: err.error})))
      );
    })
  );

  @Effect()
  activateAccount$ = this.actions$.pipe(ofType(AuthActionTypes.ACTIVATE_ACCOUNT)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.authService.activateAccount(payload).pipe(
        switchMap(() => {
          const message = this.translate.instant('AUTH.ACTIVATE_ACCOUNT.MESSAGE');
          return of(new SignUpSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new SignUpFailure({error: err.error})))
      );
    })
  );

  @Effect()
  forgotPassword$ = this.actions$.pipe(ofType(AuthActionTypes.FORGOT_PASSWORD)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.authService.forgotPassword(payload).pipe(
        switchMap(() => {
          const message = this.translate.instant('AUTH.FORGOT_PASSWORD.MESSAGE');
          return of(new SignUpSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new SignUpFailure({error: err.error})))
      );
    })
  );

  @Effect()
  recoveryPassword$ = this.actions$.pipe(ofType(AuthActionTypes.RECOVERY_PASSWORD)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.authService.recoveryPassword(payload.token, payload.password).pipe(
        switchMap(() => {
          const message = this.translate.instant('AUTH.RECOVERY_PASSWORD.MESSAGE');
          return of(new SignUpSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new SignUpFailure({error: err.error})))
      );
    })
  );

  @Effect({dispatch: false})
  signUpSuccess$ = this.actions$.pipe(
    ofType(AuthActionTypes.SIGNUP_SUCCESS),
    tap(() => {
      window.location.href = '/auth';
    })
  );

  @Effect({dispatch: false})
  signUpFailure$ = this.actions$.pipe(
    ofType(AuthActionTypes.SIGNUP_FAILURE)
  );

  @Effect({dispatch: false})
  public logOut$ = this.actions$.pipe(
    ofType(AuthActionTypes.LOGOUT),
    tap(() => {
      localStorage.removeItem('auth');
      window.location.href = '/auth';
    })
  );

  constructor(private readonly translate: TranslateService, private actions$: Actions, private authService: AuthService,
              private router: Router) {
  }
}
