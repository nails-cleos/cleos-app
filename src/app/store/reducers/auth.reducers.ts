import { IMenu, IUser } from '../../interfaces/user';
import { All, AuthActionTypes } from '../auth.actions';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { Params } from '@angular/router';

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

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case AuthActionTypes.login: {
      return {
        ...state,
        errorMessage: undefined,
        error: undefined,
        response: undefined,
        subErrors: undefined,
        isLoading: true,
        redirect: false,
      };
    }
    case AuthActionTypes.loginFailure:
    case AuthActionTypes.signupFailure: {
      return {
        ...state,
        isLoading: false,
        errorMessage: action.error.message,
        error: action.error,
        response: undefined,
        subErrors: action.error.subErrors,
        redirect: false,
      };
    }
    case AuthActionTypes.loginSuccess: {
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.token.user,
        token: action.token.tokenAccess,
        menus: action.token.menus,
        errorMessage: undefined,
        response: undefined,
        subErrors: undefined,
        queryParams: action.queryParams,
        redirect: false,
      };
    }
    case AuthActionTypes.redirect: {
      return {
        ...state,
        redirect: true,
      };
    }
    case AuthActionTypes.signupSuccess: {
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        errorMessage: undefined,
        response: action,
        subErrors: undefined,
        redirect: false,
      };
    }
    case AuthActionTypes.clean: {
      return {
        ...state,
        isLoading: false,
        errorMessage: undefined,
        response: undefined,
        subErrors: undefined,
        queryParams: undefined,
        redirect: false,
      };
    }
    case AuthActionTypes.reLogin:
    case AuthActionTypes.logout: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
