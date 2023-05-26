import { Action } from '@ngrx/store';

export enum UserActionTypes {
  getAll = '[User] Get all',
  getAllCustomers = '[User] Get all customers',
  userSuccess = '[User] Success',
  userFailure = '[User] Failure',
  userSelected = '[User] Selected',
  userOverview = '[User] Overview',
  findUser = '[User] Find',
  findMe = '[User] Me',
  setRole = '[User] Add role',
  saveUser = '[User] Save',
  updateUser = '[User] Update',
  updatePhoto = '[User] Update photo',
  userSaveSuccess = '[User] Save Success',
  userDelete = '[User] Delete',
  userRestore = '[User] Restore',
  resendUserToken = '[User] Resend user token',
  changePassword = '[Auth] Change password',
  changePasswordSuccess = '[Auth] Change password Success',
  getAllDisableUsers = '[User] Get all disable users',
  disableUsersSuccess = '[User] Disable users success',
  mergeUsers = '[User] Merge users',
  clean = '[User] Clean'
}

export class GetAll implements Action {
  readonly type = UserActionTypes.getAll;

  constructor(public payload: any) {
  }
}

export class GetAllCustomers implements Action {
  readonly type = UserActionTypes.getAllCustomers;
}

export class UserSuccess implements Action {
  readonly type = UserActionTypes.userSuccess;

  constructor(public payload: any) {
  }
}

export class UserFailure implements Action {
  readonly type = UserActionTypes.userFailure;

  constructor(public payload: any) {
  }
}

export class UserSelected implements Action {
  readonly type = UserActionTypes.userSelected;

  constructor(public payload: any) {
  }
}

export class UserOverview implements Action {
  readonly type = UserActionTypes.userOverview;

  constructor(public payload: any) {
  }
}

export class FindUser implements Action {
  readonly type = UserActionTypes.findUser;

  constructor(public payload: any) {
  }
}

export class FindMe implements Action {
  readonly type = UserActionTypes.findMe;
}

export class SaveUser implements Action {
  readonly type = UserActionTypes.saveUser;

  constructor(public payload: any) {
  }
}

export class SetRole implements Action {
  readonly type = UserActionTypes.setRole;

  constructor(public payload: any) {
  }
}

export class UpdateUser implements Action {
  readonly type = UserActionTypes.updateUser;

  constructor(public payload: any) {
  }
}

export class UpdatePhoto implements Action {
  readonly type = UserActionTypes.updatePhoto;

  constructor(public payload: any) {
  }
}

export class UserSaveSuccess implements Action {
  readonly type = UserActionTypes.userSaveSuccess;

  constructor(public payload: any) {
  }
}

export class DeleteUser implements Action {
  readonly type = UserActionTypes.userDelete;

  constructor(public payload: any) {
  }
}

export class RestoreUser implements Action {
  readonly type = UserActionTypes.userRestore;

  constructor(public payload: any) {
  }
}

export class ResendToken implements Action {
  readonly type = UserActionTypes.resendUserToken;

  constructor(public payload: any) {
  }
}

export class ChangePassword implements Action {
  readonly type = UserActionTypes.changePassword;

  constructor(public payload: any) {
  }
}

export class ChangePasswordSuccess implements Action {
  readonly type = UserActionTypes.changePasswordSuccess;

  constructor(public payload: any) {
  }
}

export class GetAllDisableUsers implements Action {
  readonly type = UserActionTypes.getAllDisableUsers;
}

export class DisableUsersSuccess implements Action {
  readonly type = UserActionTypes.disableUsersSuccess;

  constructor(public payload: any) {
  }
}

export class MergeUsers implements Action {
  readonly type = UserActionTypes.mergeUsers;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = UserActionTypes.clean;
}

export type All =
  | GetAll
  | GetAllCustomers
  | UserSuccess
  | UserFailure
  | UserSelected
  | UserOverview
  | FindUser
  | FindMe
  | SaveUser
  | SetRole
  | UpdateUser
  | UpdatePhoto
  | UserSaveSuccess
  | DeleteUser
  | RestoreUser
  | ResendToken
  | ChangePassword
  | ChangePasswordSuccess
  | GetAllDisableUsers
  | DisableUsersSuccess
  | MergeUsers
  | Clean;
