import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthActionTypes, LoginFailure, LoginSuccess, SignUpSuccess, SignUpFailure } from '../auth.actions';

@Injectable()
export class LoginEffects {
  returnUrl: string;

  @Effect()
  login$ = this.actions$.pipe(ofType(AuthActionTypes.LOGIN)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.authService.login(payload.username, payload.password).pipe(
        switchMap((response: any) => {
          return of(new LoginSuccess(response));
        }),
        catchError((err: HttpErrorResponse) => of(new LoginFailure({error: err})))
      );
    })
  );

  @Effect()
  socialLogin$ = this.actions$.pipe(ofType(AuthActionTypes.SOCIAL_LOGIN)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.authService.socialLogin(payload.idToken || payload.authToken, payload.provider).pipe(
        switchMap((response: any) => {
          return of(new LoginSuccess(response));
        }),
        catchError((err: HttpErrorResponse) => of(new LoginFailure({error: err.error})))
      );
    })
  );

  @Effect({dispatch: false})
  loginSuccess$ = this.actions$.pipe(
    ofType(AuthActionTypes.LOGIN_SUCCESS),
    tap(() => this.router.navigate([this.returnUrl]))
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
          return of(new SignUpSuccess(response));
        }),
        catchError((err: HttpErrorResponse) => of(new SignUpFailure({error: err.error})))
      );
    })
  );

  @Effect({dispatch: false})
  signUpSuccess$ = this.actions$.pipe(
    ofType(AuthActionTypes.SIGNUP_SUCCESS),
    tap(() => location.reload(true))
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
      location.reload(true);
    })
  );

  constructor(private actions$: Actions, private authService: AuthService,
              private router: Router, private route: ActivatedRoute) {
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || 'dashboard/main';
  }
}
