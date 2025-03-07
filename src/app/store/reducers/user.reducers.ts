import { All, UserActionTypes } from '../user.actions';
import { IOverview, IUser, IUserAll } from '../../interfaces/user';
import { Pagination } from '../../interfaces/pagination';

export interface State {
  data: IUser | IUserAll[] | Pagination<IUser> | IOverview | null;
  users: IUserAll[] | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IUser | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  users: null,
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
        data: { content: [{}, {}, {}], totalElements: 3 },
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case UserActionTypes.getAllCustomers: {
      return {
        ...state,
        data: [] as IUserAll[],
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case UserActionTypes.userOverview:
    case UserActionTypes.findMe:
    case UserActionTypes.findUser: {
      return {
        ...state,
        data: {},
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case UserActionTypes.userSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case UserActionTypes.userSelected: {
      return {
        ...state,
        selected: action.payload.user,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
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
    case UserActionTypes.mergeUsers:
    case UserActionTypes.setRole:
    case UserActionTypes.saveUser:
    case UserActionTypes.updateUser:
    case UserActionTypes.updatePhoto:
    case UserActionTypes.resendUserToken:
    case UserActionTypes.userRestore:
    case UserActionTypes.userDelete: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case UserActionTypes.getAllDisableUsers: {
      return {
        ...state,
        users: [] as IUserAll[],
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case UserActionTypes.disableUsersSuccess: {
      return {
        ...state,
        users: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
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
