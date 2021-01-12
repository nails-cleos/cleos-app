import { All, UserActionTypes } from '../user.actions';
import { IUser } from '../../interfaces/user';
import { Pagination } from '../../interfaces/pagination';

export interface State {
  data: IUser | Pagination<IUser> | null;
  errorMessage: string | null;
  subErrors: any;
  selected: IUser | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  errorMessage: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false
};

export function reducer(state = initialState, action: All): State {
  switch (action.type) {
    case UserActionTypes.GET_ALL: {
      return {
        ...state,
        // @ts-ignore
        data: {content: [{}, {}, {}], totalElements: 3},
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case UserActionTypes.FIND_USER: {
      return {
        ...state,
        data: {},
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case UserActionTypes.USER_SUCCESS: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case UserActionTypes.USER_SELECTED: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case UserActionTypes.USER_SAVE_SUCCESS: {
      return {
        ...state,
        message: action.payload.message,
        errorMessage: null,
        subErrors: null,
        isLoading: false
      };
    }
    case UserActionTypes.USER_FAILURE: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case UserActionTypes.SAVE_USER:
    case UserActionTypes.RESEND_USER_TOKEN:
    case UserActionTypes.USER_DELETE: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
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
