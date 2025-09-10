import { Action } from '@ngrx/store';
import { IError, PageRequest, ResponseSuccess } from '../interfaces/common';
import { SortDirection } from '@angular/material/sort';
import { PAGE_SIZE } from '../interfaces/notification';
import { Pagination } from '../interfaces/pagination';
import { IOverview, IUser } from '../interfaces/user';
import { Role } from '../interfaces/token';

export enum UserActionTypes {
  getUsersPage = '[User] Get users page',
  getAllCustomers = '[User] Get all customers',
  userSuccess = '[User] Success',
  userFailure = '[User] Failure',
  userSelected = '[User] Selected',
  getCustomerOverview = '[User] Get customer overview',
  getUser = '[User] Get user by id',
  getMyUser = '[User] Find me',
  setRole = '[User] Add role',
  saveUser = '[User] Save',
  updateMyUser = '[User] Update me',
  updateMyPhoto = '[User] Update me photo',
  userSaveSuccess = '[User] Save Success',
  deleteUser = '[User] Delete user by id',
  restore = '[User] Restore',
  resendToken = '[User] Resend token',
  getAllDisableUsers = '[User] Find all disable users',
  disableUsersSuccess = '[User] Disable users success',
  mergeUsers = '[User] Merge users',
  clean = '[User] Clean'
}

export class GetUsersPage extends PageRequest implements Action {
  readonly type = UserActionTypes.getUsersPage;

  constructor(page: number, sort: string, direction: SortDirection, size: number = PAGE_SIZE, public filter?: string) {
    super(page, sort, direction, size);
  }
}

export class GetAllCustomers implements Action {
  readonly type = UserActionTypes.getAllCustomers;
}

export class UserSuccess implements Action {
  readonly type = UserActionTypes.userSuccess;

  constructor(public data: Pagination<IUser> | IUser[] | IOverview) {
  }
}

export class UserFailure implements Action {
  readonly type = UserActionTypes.userFailure;

  constructor(public error: IError) {
  }
}

export class UserSelected implements Action {
  readonly type = UserActionTypes.userSelected;

  constructor(public selected?: IUser, public profile?: boolean) {
  }
}

export class GetCustomerOverview implements Action {
  readonly type = UserActionTypes.getCustomerOverview;

  constructor(public id: string | null) {
  }
}

export class getUser implements Action {
  readonly type = UserActionTypes.getUser;

  constructor(public id: string) {
  }
}

export class GetMyUser implements Action {
  readonly type = UserActionTypes.getMyUser;
}

export class SaveUser implements Action {
  readonly type = UserActionTypes.saveUser;

  constructor(public user: IUser, public role?: Role) {
  }
}

export class SetRole implements Action {
  readonly type = UserActionTypes.setRole;

  constructor(public id: string, public displayName: string, public role: Role, public action: 'ADD' | 'REMOVE') {
  }
}

export class UpdateMyUser implements Action {
  readonly type = UserActionTypes.updateMyUser;

  constructor(public user: IUser, public redirectUrl?: string, public message?: string) {
  }
}

export class UpdateMyPhoto implements Action {
  readonly type = UserActionTypes.updateMyPhoto;

  constructor(public file: string) {
  }
}

export class UserSaveSuccess extends ResponseSuccess implements Action {
  readonly type = UserActionTypes.userSaveSuccess;
}

export class DeleteUser implements Action {
  readonly type = UserActionTypes.deleteUser;

  constructor(public id: string, public displayName: string) {
  }
}

export class Restore implements Action {
  readonly type = UserActionTypes.restore;

  constructor(public id: string, public user: IUser, public displayName: string) {
  }
}

export class ResendToken implements Action {
  readonly type = UserActionTypes.resendToken;

  constructor(public id: string) {
  }
}

export class GetAllDisableUsers implements Action {
  readonly type = UserActionTypes.getAllDisableUsers;
}

export class DisableUsersSuccess implements Action {
  readonly type = UserActionTypes.disableUsersSuccess;

  constructor(public users: IUser[]) {
  }
}

export class MergeUsers implements Action {
  readonly type = UserActionTypes.mergeUsers;

  constructor(public oldUserId: string, public newUserId: string) {
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
  | GetCustomerOverview
  | getUser
  | GetMyUser
  | SaveUser
  | SetRole
  | UpdateMyUser
  | UpdateMyPhoto
  | UserSaveSuccess
  | DeleteUser
  | Restore
  | ResendToken
  | GetAllDisableUsers
  | DisableUsersSuccess
  | MergeUsers
  | Clean;
