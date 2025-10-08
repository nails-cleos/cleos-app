import { All, UserActionTypes } from '../user.actions';
import { IOverview, IUser, IUserAll } from '../../interfaces/user';
import { Pagination } from '../../interfaces/pagination';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: IUser[] | Pagination<IUser> | IOverview;
  users?: IUser[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IUser;
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  users: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case UserActionTypes.getUsersPage: {
      return {
        ...state,
        data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IUser>,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case UserActionTypes.getAllCustomers: {
      return {
        ...state,
        data: [] as IUserAll[],
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case UserActionTypes.getCustomerOverview: {
      return {
        ...state,
        data: {} as IOverview,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case UserActionTypes.getMyUser:
    case UserActionTypes.getUser: {
      return {
        ...state,
        selected: {},
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case UserActionTypes.userSuccess: {
      return {
        ...state,
        data: action.data,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case UserActionTypes.userSelected: {
      return {
        ...state,
        selected: action.selected,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case UserActionTypes.userSaveSuccess: {
      return {
        ...state,
        response: action,
        selected: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: false,
      };
    }
    case UserActionTypes.userFailure: {
      return {
        ...state,
        errorMessage: action.error.message,
        error: action.error,
        subErrors: action.error.subErrors,
        response: undefined,
        isLoading: false,
      };
    }
    case UserActionTypes.mergeUsers:
    case UserActionTypes.setRole:
    case UserActionTypes.saveUser:
    case UserActionTypes.updateMyUser:
    case UserActionTypes.updateMyPhoto:
    case UserActionTypes.resendToken:
    case UserActionTypes.restore:
    case UserActionTypes.deleteUser: {
      return {
        ...state,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
        isLoading: true,
      };
    }
    case UserActionTypes.getAllDisableUsers: {
      return {
        ...state,
        users: [] as IUserAll[],
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case UserActionTypes.disableUsersSuccess: {
      return {
        ...state,
        users: action.users,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
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
