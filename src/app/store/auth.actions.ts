import { Action } from '@ngrx/store';
import { Params } from '@angular/router';
import { IError, ResponseSuccess } from '../interfaces/common';
import { Token } from '../interfaces/token';

export enum AuthActionTypes {
  login = '[Auth] Login',
  redirect = '[Auth] Redirect',
  loginSuccess = '[Auth] Login Success',
  loginFailure = '[Auth] Login Failure',
  signupSuccess = '[Auth] Signup Success',
  signupFailure = '[Auth] Signup Failure',
  logout = '[Auth] Logout',
  reLogin = '[Auth] Re login',
  clean = '[Auth] Clean'
}

export class Login implements Action {
  readonly type = AuthActionTypes.login;

  constructor(public token: string, public queryParams: Params, public theme: string, public code: string | null) {
  }
}

export class Redirect implements Action {
  readonly type = AuthActionTypes.redirect;
}

export class LoginSuccess implements Action {
  readonly type = AuthActionTypes.loginSuccess;

  constructor(public token: Token, public queryParams: Params, public redirect?: boolean) {
  }
}

export class LoginFailure implements Action {
  readonly type = AuthActionTypes.loginFailure;

  constructor(public error: IError) {
  }
}

export class SignUpSuccess extends ResponseSuccess implements Action {
  readonly type = AuthActionTypes.signupSuccess;
}

export class SignUpFailure implements Action {
  readonly type = AuthActionTypes.signupFailure;

  constructor(public error: IError) {
  }
}

export class LogOut implements Action {
  readonly type = AuthActionTypes.logout;
}

export class ReLogin implements Action {
  readonly type = AuthActionTypes.reLogin;
}

export class Clean implements Action {
  readonly type = AuthActionTypes.clean;
}

export type All =
  | Login
  | LoginSuccess
  | Redirect
  | LoginFailure
  | SignUpSuccess
  | SignUpFailure
  | LogOut
  | ReLogin
  | Clean;
