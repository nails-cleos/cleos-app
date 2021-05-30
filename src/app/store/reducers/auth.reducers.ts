import { IMenu, IUser } from '../../interfaces/user';
import { All, AuthActionTypes } from '../auth.actions';

export interface State {
  isAuthenticated: boolean;
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
  isLoading: false,
  user: null,
  token: null,
  menus: null,
  errorMessage: null,
  error: null,
  message: null,
  subErrors: null,
  queryParams: {}
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case AuthActionTypes.login:
    case AuthActionTypes.signup:
    case AuthActionTypes.socialLogin: {
      return {
        ...state,
        isLoading: true
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
        subErrors: action.payload.error.subErrors
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
        queryParams: action.payload.queryParams
      };
    }
    case AuthActionTypes.signupSuccess: {
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        errorMessage: null,
        message: action.payload.message,
        subErrors: null
      };
    }
    case AuthActionTypes.forgotPassword:
    case AuthActionTypes.recoveryPassword:
    case AuthActionTypes.activateAccount: {
      return {
        ...state,
        isAuthenticated: false,
        errorMessage: null,
        message: action.payload.message,
        subErrors: null
      };
    }
    case AuthActionTypes.clean: {
      return {
        ...state,
        isLoading: false,
        errorMessage: null,
        message: null,
        subErrors: null,
        queryParams: null
      };
    }
    case AuthActionTypes.logout: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
