import {
  cleanUser,
  deleteUser,
  disableUsersSuccess,
  getAllCustomers,
  getAllDisableUsers,
  getCustomerOverview,
  getMyUser,
  getUser,
  getUsersPage,
  mergeUsers,
  resendToken,
  restore,
  saveUser,
  setCurrentUserId,
  setRole,
  setUserNavigationParams,
  updateMyPhoto,
  updateMyUser,
  userFailure,
  userSaveSuccess,
  userSelected,
  userSuccess,
} from '../user.actions';
import { IOverview, IUserAll } from '../../interfaces/user';
import { Pagination } from '../../interfaces/pagination';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';
import { Role } from '../../interfaces/token';

export const USER_FEATURE_KEY = 'user';

export interface UserState {
  response?: IResponseSuccess;
  data?: IUserAll[] | Pagination<IUserAll> | IOverview;
  users?: IUserAll[];
  error?: IError;
  subErrors?: IError[];
  selected?: IUserAll;
  currentUserId?: string;
  userNavigationParams?: { role?: Role };
  isLoading: boolean;
}

export const initialState: UserState = {
  data: undefined,
  users: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  currentUserId: undefined,
  userNavigationParams: undefined,
  isLoading: false,
};

export const userReducer = createReducer(
  initialState,
  on(getUsersPage, (state) => ({
    ...state,
    data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IUserAll>,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllCustomers, (state) => ({
    ...state,
    data: [] as IUserAll[],
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getCustomerOverview, (state) => ({
    ...state,
    data: {} as IOverview,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getMyUser, getUser, (state) => ({
    ...state,
    selected: {} as IUserAll,
    subErrors: undefined,
    response: undefined,
  })),
  on(userSuccess, (state, { data }) => ({
    ...state,
    data,
    subErrors: undefined,
    response: undefined,
  })),
  on(userSelected, (state, { selected }) => ({
    ...state,
    selected,
    subErrors: undefined,
    response: undefined,
  })),
  on(userSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(userFailure, (state, { error }) => ({
    ...state,
    error: error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(mergeUsers, setRole, saveUser, updateMyUser, updateMyPhoto, resendToken, restore, deleteUser, (state) => ({
    ...state,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(getAllDisableUsers, (state) => ({
    ...state,
    users: [] as IUserAll[],
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(disableUsersSuccess, (state, { users }) => ({
    ...state,
    users: users,
    subErrors: undefined,
    response: undefined,
  })),
  on(setCurrentUserId, (state, { userId }) => ({
    ...state,
    currentUserId: userId,
  })),
  on(setUserNavigationParams, (state, { role }) => ({
    ...state,
    userNavigationParams: { role },
  })),
  on(cleanUser, () => initialState),
);
