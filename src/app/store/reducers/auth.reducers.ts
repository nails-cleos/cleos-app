import { IUser } from '../../interfaces/user';
import { All, AuthActionTypes } from '../auth.actions';

export interface State {
  isAuthenticated: boolean;
  user: IUser | null;
  token: null;
  errorMessage: string | null;
  message: string | null;
  subErrors: any;
  queryParams: any;
}

export const initialState: State = {
  isAuthenticated: false,
  user: null,
  token: null,
  errorMessage: null,
  message: null,
  subErrors: null,
  queryParams: {}
};

export function reducer(state = initialState, action: All): State {
  switch (action.type) {
    case AuthActionTypes.LOGIN_FAILURE:
    case AuthActionTypes.SIGNUP_FAILURE: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        message: null,
        subErrors: action.payload.error.subErrors
      };
    }
    case AuthActionTypes.LOGIN_SUCCESS: {
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.response.user,
        token: action.payload.response.tokenAccess,
        errorMessage: null,
        message: null,
        subErrors: null,
        queryParams: action.payload.queryParams
      };
    }
    case AuthActionTypes.SIGNUP_SUCCESS: {
      return {
        ...state,
        isAuthenticated: false,
        errorMessage: null,
        message: action.payload.message,
        subErrors: null
      };
    }
    case AuthActionTypes.FORGOT_PASSWORD:
    case AuthActionTypes.RECOVERY_PASSWORD:
    case AuthActionTypes.ACTIVATE_ACCOUNT: {
      return {
        ...state,
        isAuthenticated: false,
        errorMessage: null,
        message: action.payload.message,
        subErrors: null
      };
    }
    case AuthActionTypes.CLEAN: {
      return {
        ...state,
        errorMessage: null,
        message: null,
        subErrors: null,
        queryParams: null
      };
    }
    case AuthActionTypes.LOGOUT: {
      return initialState;
    }
    default: {
      return state;
    }
  }
}
