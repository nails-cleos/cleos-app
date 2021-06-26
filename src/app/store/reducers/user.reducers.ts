import { All, UserActionTypes } from '../user.actions';
import { IUser } from '../../interfaces/user';
import { Pagination } from '../../interfaces/pagination';

export interface State {
  data: IUser | Pagination<IUser> | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IUser | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case UserActionTypes.getAll: {
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
    case UserActionTypes.getAllCustomers: {
      return {
        ...state,
        // @ts-ignore
        data: [],
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case UserActionTypes.findMe:
    case UserActionTypes.findUser: {
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
    case UserActionTypes.userSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case UserActionTypes.userSelected: {
      return {
        ...state,
        selected: action.payload.user,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case UserActionTypes.changePasswordSuccess:
    case UserActionTypes.userSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        selected: null,
        errorMessage: null,
        subErrors: null,
        isLoading: false
      };
    }
    case UserActionTypes.userFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case UserActionTypes.setRole:
    case UserActionTypes.changePassword:
    case UserActionTypes.saveUser:
    case UserActionTypes.updateUser:
    case UserActionTypes.updatePhoto:
    case UserActionTypes.resendUserToken:
    case UserActionTypes.userDelete: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case UserActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
