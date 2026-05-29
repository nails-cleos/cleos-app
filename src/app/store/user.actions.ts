import { createAction, props } from '@ngrx/store';
import { IError, IResponseSuccess, PageRequest } from '../interfaces/common';
import { IUser, IUserAll } from '../interfaces/user';
import { Role } from '../interfaces/token';
import { UserData } from './reducers/user.reducers';

enum UserActionTypes {
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
  setUserNavigationParams = '[User] Set user navigation params',
  clean = '[User] Clean'
}

export const getUsersPage = createAction(
  UserActionTypes.getUsersPage,
  props<PageRequest & { filter?: string }>(),
);

export const getAllCustomers = createAction(UserActionTypes.getAllCustomers);

export const userSuccess = createAction(
  UserActionTypes.userSuccess,
  props<{ data: UserData }>(),
);

export const userFailure = createAction(
  UserActionTypes.userFailure,
  props<{ error: IError }>(),
);

export const userSelected = createAction(
  UserActionTypes.userSelected,
  props<{ selected?: IUserAll; profile?: boolean }>(),
);

export const getCustomerOverview = createAction(
  UserActionTypes.getCustomerOverview,
  props<{ id: string }>(),
);

export const getUser = createAction(
  UserActionTypes.getUser,
  props<{ id: string }>(),
);

export const getMyUser = createAction(UserActionTypes.getMyUser);

export const saveUser = createAction(
  UserActionTypes.saveUser,
  props<{ user: IUser; role?: Role }>(),
);

export const setRole = createAction(
  UserActionTypes.setRole,
  props<{ id: string; displayName: string; role: Role; action: 'ADD' | 'REMOVE' }>(),
);

export const updateMyUser = createAction(
  UserActionTypes.updateMyUser,
  props<{ user: IUser; redirectUrl?: string; message?: string }>(),
);

export const updateMyPhoto = createAction(
  UserActionTypes.updateMyPhoto,
  props<{ file: string }>(),
);

export const userSaveSuccess = createAction(
  UserActionTypes.userSaveSuccess,
  props<IResponseSuccess>(),
);

export const deleteUser = createAction(
  UserActionTypes.deleteUser,
  props<{ id: string; displayName: string }>(),
);

export const restore = createAction(
  UserActionTypes.restore,
  props<{ id: string; user: IUser; }>(),
);

export const resendToken = createAction(
  UserActionTypes.resendToken,
  props<{ id: string }>(),
);

export const getAllDisableUsers = createAction(UserActionTypes.getAllDisableUsers);

export const disableUsersSuccess = createAction(
  UserActionTypes.disableUsersSuccess,
  props<{ users: IUserAll[] }>(),
);

export const mergeUsers = createAction(
  UserActionTypes.mergeUsers,
  props<{ oldUserId: string; newUserId: string }>(),
);

export const setUserNavigationParams = createAction(
  UserActionTypes.setUserNavigationParams,
  props<{ role?: Role }>(),
);

export const cleanUser = createAction(UserActionTypes.clean);
