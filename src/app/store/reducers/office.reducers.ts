import { Pagination } from '../../interfaces/pagination';
import { All, OfficeActionTypes } from '../office.actions';
import { IOffice } from '../../interfaces/office';
import { IUser } from '../../interfaces/user';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: IOffice | Pagination<IOffice>;
  managers?: IUser[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IOffice;
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  managers: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case OfficeActionTypes.getOfficesPage: {
      return {
        ...state,
        data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IOffice>,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case OfficeActionTypes.getAllManager: {
      return {
        ...state,
        managers: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case OfficeActionTypes.getOffice: {
      return {
        ...state,
        data: {} as IOffice,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case OfficeActionTypes.officeSuccess: {
      return {
        ...state,
        data: action.data,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case OfficeActionTypes.managerSuccess: {
      return {
        ...state,
        managers: action.managers,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case OfficeActionTypes.officeSaveSuccess: {
      return {
        ...state,
        response: action,
        selected: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: false,
      };
    }
    case OfficeActionTypes.officeSelected: {
      return {
        ...state,
        selected: action.selected,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case OfficeActionTypes.officeFailure: {
      return {
        ...state,
        errorMessage: action.error.message,
        error: action.error,
        subErrors: action.error.subErrors,
        response: undefined,
        isLoading: false,
      };
    }
    case OfficeActionTypes.updateOffice:
    case OfficeActionTypes.createOffice:
    case OfficeActionTypes.deleteOffice: {
      return {
        ...state,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
        isLoading: true,
      };
    }
    case OfficeActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
