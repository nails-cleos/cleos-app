import {
  clean,
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
  setRole,
  updateMyPhoto,
  updateMyUser,
  userFailure,
  userSaveSuccess,
  userSelected,
  userSuccess,
} from '../user.actions';
import { IOverview, IUser, IUserAll } from '../../interfaces/user';
import { Pagination } from '../../interfaces/pagination';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';

export interface State {
  response?: IResponseSuccess;
  data?: IUser[] | Pagination<IUser> | IOverview;
  users?: IUser[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IUser;
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  users: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const userReducer = createReducer(
  initialState,
  on(getUsersPage, (state) => ({
    ...state,
    data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IUser>,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllCustomers, (state) => ({
    ...state,
    data: [] as IUserAll[],
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getCustomerOverview, (state) => ({
    ...state,
    data: {} as IOverview,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getMyUser, getUser, (state) => ({
    ...state,
    selected: {},
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(userSuccess, (state, { data }) => ({
    ...state,
    data: data,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(userSelected, (state, { selected }) => ({
    ...state,
    selected: selected,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(userSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(userFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    error: error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(mergeUsers, setRole, saveUser, updateMyUser, updateMyPhoto, resendToken, restore, deleteUser, (state) => ({
    ...state,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(getAllDisableUsers, (state) => ({
    ...state,
    users: [] as IUserAll[],
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(disableUsersSuccess, (state, { users }) => ({
    ...state,
    users: users,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(clean, () => initialState),
);
