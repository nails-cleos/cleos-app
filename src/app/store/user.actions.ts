import { Action } from '@ngrx/store';

export enum UserActionTypes {
  getUsersPage = '[User] Get users page',
  getAllCustomers = '[User] Get all customers',
  userSuccess = '[User] Success',
  userFailure = '[User] Failure',
  userSelected = '[User] Selected',
  userOverview = '[User] Overview',
  getUserById = '[User] Get user by id',
  findMe = '[User] Find me',
  setRole = '[User] Add role',
  saveUser = '[User] Save',
  updateMe = '[User] Update me',
  updateMePhoto = '[User] Update me photo',
  userSaveSuccess = '[User] Save Success',
  deleteUserById = '[User] Delete user by id',
  userRestore = '[User] Restore',
  resendToken = '[User] Resend token',
  findAllDisableUsers = '[User] Find all disable users',
  disableUsersSuccess = '[User] Disable users success',
  mergeUsers = '[User] Merge users',
  clean = '[User] Clean'
}

export class GetUsersPage implements Action {
  readonly type = UserActionTypes.getUsersPage;

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

export class GetUserById implements Action {
  readonly type = UserActionTypes.getUserById;

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

export class UpdateMe implements Action {
  readonly type = UserActionTypes.updateMe;

  constructor(public payload: any) {
  }
}

export class UpdateMePhoto implements Action {
  readonly type = UserActionTypes.updateMePhoto;

  constructor(public payload: any) {
  }
}

export class UserSaveSuccess implements Action {
  readonly type = UserActionTypes.userSaveSuccess;

  constructor(public payload: any) {
  }
}

export class DeleteUserById implements Action {
  readonly type = UserActionTypes.deleteUserById;

  constructor(public payload: any) {
  }
}

export class RestoreUser implements Action {
  readonly type = UserActionTypes.userRestore;

  constructor(public payload: any) {
  }
}

export class ResendToken implements Action {
  readonly type = UserActionTypes.resendToken;

  constructor(public payload: any) {
  }
}

export class FindAllDisableUsers implements Action {
  readonly type = UserActionTypes.findAllDisableUsers;
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
  | GetUsersPage
  | GetAllCustomers
  | UserSuccess
  | UserFailure
  | UserSelected
  | UserOverview
  | GetUserById
  | FindMe
  | SaveUser
  | SetRole
  | UpdateMe
  | UpdateMePhoto
  | UserSaveSuccess
  | DeleteUserById
  | RestoreUser
  | ResendToken
  | FindAllDisableUsers
  | DisableUsersSuccess
  | MergeUsers
  | Clean;
