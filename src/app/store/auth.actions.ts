import { Action } from '@ngrx/store';

export enum AuthActionTypes {
  login = '[Auth] Login',
  refreshToken = '[Auth] Refresh token',
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

  constructor(public payload: any) {
  }
}

export class RefreshToken implements Action {
  readonly type = AuthActionTypes.refreshToken;

  constructor(public payload: any) {
  }
}

export class Redirect implements Action {
  readonly type = AuthActionTypes.redirect;
}

export class LoginSuccess implements Action {
  readonly type = AuthActionTypes.loginSuccess;

  constructor(public payload: any) {
  }
}

export class LoginFailure implements Action {
  readonly type = AuthActionTypes.loginFailure;

  constructor(public payload: any) {
  }
}

export class SignUpSuccess implements Action {
  readonly type = AuthActionTypes.signupSuccess;

  constructor(public payload: any) {
  }
}

export class SignUpFailure implements Action {
  readonly type = AuthActionTypes.signupFailure;

  constructor(public payload: any) {
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
  | RefreshToken
  | Redirect
  | LoginFailure
  | SignUpSuccess
  | SignUpFailure
  | LogOut
  | ReLogin
  | Clean;
