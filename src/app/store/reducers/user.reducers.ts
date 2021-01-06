import { All, UserActionTypes } from '../user.actions';
import { IUser } from '../../interfaces/user';
import { Pagination } from '../../interfaces/pagination';

export interface State {
  data: IUser | Pagination<IUser> | null;
  errorMessage: string | null;
  selected: IUser | null;
  message: string | null;
}

export const initialState: State = {
  data: null,
  errorMessage: null,
  selected: null,
  message: null
};

export function reducer(state = initialState, action: All): State {
  switch (action.type) {
    case UserActionTypes.GET_ALL: {
      return {
        ...state,
        // @ts-ignore
        data: {content: [{}, {}, {}], totalElements: 3},
        errorMessage: null,
        selected: null,
        message: null
      };
    }
    case UserActionTypes.FIND_USER: {
      return {
        ...state,
        data: {},
        errorMessage: null,
        selected: null,
        message: null
      };
    }
    case UserActionTypes.USER_SUCCESS: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        message: null
      };
    }
    case UserActionTypes.USER_SELECTED: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        message: null
      };
    }
    case UserActionTypes.USER_SAVE_SUCCESS: {
      return {
        ...state,
        message: action.payload.message,
        errorMessage: null
      };
    }
    case UserActionTypes.USER_FAILURE: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        message: null
      };
    }
    case UserActionTypes.SAVE_USER:
    case UserActionTypes.RESEND_USER_TOKEN:
    case UserActionTypes.USER_DELETE: {
      return {
        ...state,
        errorMessage: null,
        message: null
      };
    }
    case UserActionTypes.CLEAN: {
      return initialState;
    }
    default: {
      return state;
    }
  }
}
