import { Action } from '@ngrx/store';

export enum AuthActionTypes {
  LOGIN = '[Auth] Login',
  SOCIAL_LOGIN = '[Auth] Social Login',
  LOGIN_SUCCESS = '[Auth] Login Success',
  LOGIN_FAILURE = '[Auth] Login Failure',
  SIGNUP = '[Auth] Signup',
  SIGNUP_SUCCESS = '[Auth] Signup Success',
  SIGNUP_FAILURE = '[Auth] Signup Failure',
  LOGOUT = '[Auth] Logout',
  ACTIVATE_ACCOUNT = '[Auth] Activate Account',
  FORGOT_PASSWORD = '[Auth] Forgot password',
  RECOVERY_PASSWORD = '[Auth] Recovery password',
  CLEAN = '[Auth] Clean'
}

export class Login implements Action {
  readonly type = AuthActionTypes.LOGIN;

  constructor(public payload: any) {
  }
}

export class SocialLogin implements Action {
  readonly type = AuthActionTypes.SOCIAL_LOGIN;

  constructor(public payload: any) {
  }
}

export class LoginSuccess implements Action {
  readonly type = AuthActionTypes.LOGIN_SUCCESS;

  constructor(public payload: any) {
  }
}

export class LoginFailure implements Action {
  readonly type = AuthActionTypes.LOGIN_FAILURE;

  constructor(public payload: any) {
  }
}

export class SignUp implements Action {
  readonly type = AuthActionTypes.SIGNUP;

  constructor(public payload: any) {
  }
}

export class SignUpSuccess implements Action {
  readonly type = AuthActionTypes.SIGNUP_SUCCESS;

  constructor(public payload: any) {
  }
}

export class SignUpFailure implements Action {
  readonly type = AuthActionTypes.SIGNUP_FAILURE;

  constructor(public payload: any) {
  }
}

export class LogOut implements Action {
  readonly type = AuthActionTypes.LOGOUT;
}

export class ActivateAccount implements Action {
  readonly type = AuthActionTypes.ACTIVATE_ACCOUNT;

  constructor(public payload: any) {
  }
}

export class ForgotPassword implements Action {
  readonly type = AuthActionTypes.FORGOT_PASSWORD;

  constructor(public payload: any) {
  }
}

export class RecoveryPassword implements Action {
  readonly type = AuthActionTypes.RECOVERY_PASSWORD;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = AuthActionTypes.CLEAN;
}

export type All =
  | Login
  | SocialLogin
  | LoginSuccess
  | LoginFailure
  | SignUp
  | SignUpSuccess
  | SignUpFailure
  | ActivateAccount
  | LogOut
  | ForgotPassword
  | RecoveryPassword
  | Clean;
