import { IMenu, IUser } from '../../interfaces/user';
import { All, AuthActionTypes } from '../auth.actions';

export interface State {
  isAuthenticated: boolean;
  redirect: boolean;
  isLoading: boolean;
  user: IUser | null;
  token: null;
  menus: IMenu[] | null;
  errorMessage: string | null;
  error: any;
  message: string | null;
  subErrors: any;
  queryParams: any;
}

export const initialState: State = {
  isAuthenticated: false,
  redirect: false,
  isLoading: false,
  user: null,
  token: null,
  menus: null,
  errorMessage: null,
  error: null,
  message: null,
  subErrors: null,
  queryParams: {},
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case AuthActionTypes.login: {
      return {
        ...state,
        errorMessage: null,
        error: null,
        message: null,
        subErrors: null,
        isLoading: true,
        redirect: false,
      };
    }
    case AuthActionTypes.loginFailure:
    case AuthActionTypes.signupFailure: {
      return {
        ...state,
        isLoading: false,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        message: null,
        subErrors: action.payload.error.subErrors,
        redirect: false,
      };
    }
    case AuthActionTypes.loginSuccess: {
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.response.user,
        token: action.payload.response.tokenAccess,
        menus: action.payload.response.menus,
        errorMessage: null,
        message: null,
        subErrors: null,
        queryParams: action.payload.queryParams,
        redirect: false,
      };
    }
    case AuthActionTypes.refreshToken: {
      return {
        ...state,
        token: action.payload.refreshToken,
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
        errorMessage: null,
        message: action.payload.message,
        subErrors: null,
        redirect: false,
      };
    }
    case AuthActionTypes.clean: {
      return {
        ...state,
        isLoading: false,
        errorMessage: null,
        message: null,
        subErrors: null,
        queryParams: null,
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
