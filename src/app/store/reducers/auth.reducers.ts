import { IUser } from '../../interfaces/user';
import { All, AuthActionTypes } from '../auth.actions';

export interface State {
  isAuthenticated: boolean;
  user: IUser | null;
  token: null;
  errorMessage: string | null;
  message: string | null;
}

export const initialState: State = {
  isAuthenticated: false,
  user: null,
  token: null,
  errorMessage: null,
  message: null
};

export function reducer(state = initialState, action: All): State {
  switch (action.type) {
    case AuthActionTypes.LOGIN_FAILURE: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        message: null
      };
    }
    case AuthActionTypes.LOGIN_SUCCESS: {
      console.log(action);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.tokenAccess,
        errorMessage: null
      };
    }
    case AuthActionTypes.SIGNUP_SUCCESS: {
      return {
        ...state,
        isAuthenticated: false,
        user: action.payload,
        errorMessage: null,
        message: `User ${action.payload.username} created. Check your email ${action.payload.email}`
      };
    }
    case AuthActionTypes.SIGNUP_FAILURE: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        message: null
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
