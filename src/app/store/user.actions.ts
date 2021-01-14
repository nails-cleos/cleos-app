import { Action } from '@ngrx/store';

export enum UserActionTypes {
  GET_ALL = '[User] Get all',
  USER_SUCCESS = '[User] Success',
  USER_FAILURE = '[User] Failure',
  USER_SELECTED = '[User] Selected',
  FIND_USER = '[User] Find',
  SAVE_USER = '[User] Save',
  USER_SAVE_SUCCESS = '[User] Save Success',
  USER_DELETE = '[User] Delete',
  RESEND_USER_TOKEN = '[User] Resend user token',
  CHANGE_PASSWORD = '[Auth] Change password',
  CLEAN = '[User] Clean'
}

export class GetAll implements Action {
  readonly type = UserActionTypes.GET_ALL;

  constructor(public payload: any) {
  }
}

export class UserSuccess implements Action {
  readonly type = UserActionTypes.USER_SUCCESS;

  constructor(public payload: any) {
  }
}

export class UserFailure implements Action {
  readonly type = UserActionTypes.USER_FAILURE;

  constructor(public payload: any) {
  }
}

export class UserSelected implements Action {
  readonly type = UserActionTypes.USER_SELECTED;

  constructor(public payload: any) {
  }
}

export class FindUser implements Action {
  readonly type = UserActionTypes.FIND_USER;

  constructor(public payload: any) {
  }
}

export class SaveUser implements Action {
  readonly type = UserActionTypes.SAVE_USER;

  constructor(public payload: any) {
  }
}

export class UserSaveSuccess implements Action {
  readonly type = UserActionTypes.USER_SAVE_SUCCESS;

  constructor(public payload: any) {
  }
}

export class DeleteUser implements Action {
  readonly type = UserActionTypes.USER_DELETE;

  constructor(public payload: any) {
  }
}

export class ResendToken implements Action {
  readonly type = UserActionTypes.RESEND_USER_TOKEN;

  constructor(public payload: any) {
  }
}

export class ChangePassword implements Action {
  readonly type = UserActionTypes.CHANGE_PASSWORD;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = UserActionTypes.CLEAN;
}

export type All =
  | GetAll
  | UserSuccess
  | UserFailure
  | UserSelected
  | FindUser
  | SaveUser
  | UserSaveSuccess
  | DeleteUser
  | ResendToken
  | ChangePassword
  | Clean;
