import { Action } from '@ngrx/store';

export enum AuthActionTypes {
  login = '[Auth] Login',
  socialLogin = '[Auth] Social Login',
  loginSuccess = '[Auth] Login Success',
  loginFailure = '[Auth] Login Failure',
  signup = '[Auth] Signup',
  signupSuccess = '[Auth] Signup Success',
  signupFailure = '[Auth] Signup Failure',
  logout = '[Auth] Logout',
  activateAccount = '[Auth] Activate Account',
  forgotPassword = '[Auth] Forgot password',
  recoveryPassword = '[Auth] Recovery password',
  clean = '[Auth] Clean'
}

export class Login implements Action {
  readonly type = AuthActionTypes.login;

  constructor(public payload: any) {
  }
}

export class SocialLogin implements Action {
  readonly type = AuthActionTypes.socialLogin;

  constructor(public payload: any) {
  }
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

export class SignUp implements Action {
  readonly type = AuthActionTypes.signup;

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

export class ActivateAccount implements Action {
  readonly type = AuthActionTypes.activateAccount;

  constructor(public payload: any) {
  }
}

export class ForgotPassword implements Action {
  readonly type = AuthActionTypes.forgotPassword;

  constructor(public payload: any) {
  }
}

export class RecoveryPassword implements Action {
  readonly type = AuthActionTypes.recoveryPassword;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = AuthActionTypes.clean;
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
