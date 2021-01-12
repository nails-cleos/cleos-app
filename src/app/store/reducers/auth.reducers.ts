import { IUser } from '../../interfaces/user';
import { All, AuthActionTypes } from '../auth.actions';

export interface State {
  isAuthenticated: boolean;
  user: IUser | null;
  token: null;
  errorMessage: string | null;
  message: string | null;
  subErrors: any;
}

export const initialState: State = {
  isAuthenticated: false,
  user: null,
  token: null,
  errorMessage: null,
  message: null,
  subErrors: null
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
        user: action.payload.user,
        token: action.payload.tokenAccess,
        errorMessage: null,
        message: null,
        subErrors: null
      };
    }
    case AuthActionTypes.SIGNUP_SUCCESS: {
      return {
        ...state,
        isAuthenticated: false,
        user: action.payload,
        errorMessage: null,
        message: action.payload.message,
        subErrors: null
      };
    }
    case AuthActionTypes.ACTIVATE_ACCOUNT: {
      return {
        ...state,
        isAuthenticated: false,
        errorMessage: null,
        message: action.payload.message,
        subErrors: null
      };
    }
    case AuthActionTypes.CLEAN:
    case AuthActionTypes.LOGOUT: {
      return initialState;
    }
    default: {
      return state;
    }
  }
}
