import { IMenu, IUser } from '../../interfaces/user';
import {
  clean,
  login,
  loginFailure,
  loginSuccess,
  logOut,
  redirect,
  signupFailure,
  signupSuccess,
} from '../auth.actions';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { Params } from '@angular/router';
import { createReducer, on } from '@ngrx/store';

export interface State {
  isAuthenticated: boolean;
  redirect: boolean;
  isLoading: boolean;
  user?: IUser;
  token?: string;
  menus?: IMenu[];
  errorMessage?: string;
  error?: IError;
  response?: IResponseSuccess;
  subErrors?: IError[];
  queryParams?: Params;
}

export const initialState: State = {
  isAuthenticated: false,
  redirect: false,
  isLoading: false,
  user: undefined,
  token: undefined,
  menus: undefined,
  errorMessage: undefined,
  error: undefined,
  response: undefined,
  subErrors: undefined,
  queryParams: {},
};

export const authReducer = createReducer(
  initialState,
  on(login, (state) => ({
    ...state,
    errorMessage: undefined,
    error: undefined,
    response: undefined,
    subErrors: undefined,
    isLoading: true,
    redirect: false,
  })),
  on(loginFailure, signupFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
    error: error,
    response: undefined,
    subErrors: error.subErrors,
    redirect: false,
  })),
  on(loginSuccess, (state, { token, queryParams }) => ({
    ...state,
    isLoading: false,
    isAuthenticated: true,
    user: token.user,
    token: token.tokenAccess,
    menus: token.menus,
    errorMessage: undefined,
    response: undefined,
    subErrors: undefined,
    queryParams: queryParams,
    redirect: false,
  })),
  on(redirect, (state) => ({
    ...state,
    redirect: true,
  })),
  on(signupSuccess, (state, action) => ({
    ...state,
    isLoading: false,
    isAuthenticated: false,
    errorMessage: undefined,
    response: action,
    subErrors: undefined,
    redirect: false,
  })),
  on(clean, (state) => ({
    ...state,
    isLoading: false,
    errorMessage: undefined,
    response: undefined,
    subErrors: undefined,
    queryParams: undefined,
    redirect: false,
  })),
  on(logOut, () => initialState),
);
