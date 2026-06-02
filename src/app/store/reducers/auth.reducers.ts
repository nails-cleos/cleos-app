import { IMenu, IUserAll } from '../../interfaces/user';
import {
  cleanAuth,
  login,
  loginFailure,
  loginSuccess,
  logOut,
  redirect,
  reLogin,
  setCurrentCode,
  setDriveToken,
  signupFailure,
  signupSuccess,
} from '../actions/auth.actions';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { Params } from '@angular/router';
import { createReducer, on } from '@ngrx/store';
import { clearGlobalError, clearGlobalResponse } from '../actions/global.actions';

export const AUTH_FEATURE_KEY = 'auth';

export interface AuthState {
  isAuthenticated: boolean;
  redirect: boolean;
  isLoading: boolean;
  user?: IUserAll;
  menus?: IMenu[];
  error?: IError;
  response?: IResponseSuccess;
  subErrors?: IError[];
  driveToken?: string;
  queryParams?: Params;
  currentCode?: string;
}

export const initialState: AuthState = {
  isAuthenticated: false,
  redirect: false,
  isLoading: false,
  user: undefined,
  menus: undefined,
  error: undefined,
  response: undefined,
  subErrors: undefined,
  driveToken: undefined,
  queryParams: {},
  currentCode: undefined,
};

export const authReducer = createReducer(
  initialState,
  on(login, (state) => ({
    ...state,
    error: undefined,
    response: undefined,
    subErrors: undefined,
    isLoading: true,
    redirect: false,
  })),
  on(loginFailure, signupFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error,
    response: undefined,
    subErrors: error.subErrors,
    redirect: false,
  })),
  on(loginSuccess, (state, { token, queryParams, redirect }) => ({
    ...state,
    isLoading: false,
    isAuthenticated: true,
    user: token.user,
    menus: token.menus,
    response: undefined,
    subErrors: undefined,
    queryParams: queryParams,
    redirect: redirect || false,
  })),
  on(redirect, (state) => ({
    ...state,
    redirect: true,
  })),
  on(signupSuccess, (state, action) => ({
    ...state,
    isLoading: false,
    isAuthenticated: false,
    response: action,
    subErrors: undefined,
    redirect: false,
  })),
  on(setCurrentCode, (state, { code }) => ({
    ...state,
    currentCode: code,
  })),
  on(setDriveToken, (state, { token }) => ({
    ...state,
    driveToken: token,
  })),
  on(reLogin, cleanAuth, logOut, () => initialState),

  on(clearGlobalResponse, (state) => ({
    ...state,
    response: undefined,
  })),

  on(clearGlobalError, (state) => ({
    ...state,
    error: undefined,
    subErrors: undefined,
  })),
);
