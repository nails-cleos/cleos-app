import { createAction, props } from '@ngrx/store';
import { Params } from '@angular/router';
import { IError, IResponseSuccess } from '../interfaces/common';
import { Token } from '../interfaces/token';

enum AuthActionTypes {
  login = '[Auth] Login',
  redirect = '[Auth] Redirect',
  loginSuccess = '[Auth] Login Success',
  loginFailure = '[Auth] Login Failure',
  signupSuccess = '[Auth] Signup Success',
  signupFailure = '[Auth] Signup Failure',
  logOut = '[Auth] Logout',
  reLogin = '[Auth] Re login',
  setCurrentCode = '[Auth] Set current code',
  setDriveToken = '[Auth] Set drive token',
  clean = '[Auth] Clean'
}

export const setCurrentCode = createAction(
  AuthActionTypes.setCurrentCode,
  props<{ code: string }>(),
);

export const setDriveToken = createAction(
  AuthActionTypes.setDriveToken,
  props<{ token: string }>(),
);

export const login = createAction(
  AuthActionTypes.login,
  props<{ token: string; queryParams: Params; theme: string; code?: string }>(),
);

export const redirect = createAction(
  AuthActionTypes.redirect,
);

export const loginSuccess = createAction(
  AuthActionTypes.loginSuccess,
  props<{ token: Token; queryParams: Params; redirect?: boolean }>(),
);

export const loginFailure = createAction(
  AuthActionTypes.loginFailure,
  props<{ error: IError }>(),
);

export const signupSuccess = createAction(
  AuthActionTypes.signupSuccess,
  props<IResponseSuccess>(),
);

export const signupFailure = createAction(
  AuthActionTypes.signupFailure,
  props<{ error: IError }>(),
);

export const logOut = createAction(
  AuthActionTypes.logOut,
);

export const reLogin = createAction(
  AuthActionTypes.reLogin,
);

export const cleanAuth = createAction(
  AuthActionTypes.clean,
);
