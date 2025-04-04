import { Pagination } from '../../interfaces/pagination';
import { All, OfficeActionTypes } from '../office.actions';
import { IOffice } from '../../interfaces/office';
import { IUser } from '../../interfaces/user';

export interface State {
  data: IOffice | Pagination<IOffice> | null;
  managers: IUser[] | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IOffice | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  managers: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case OfficeActionTypes.getAll: {
      return {
        ...state,
        data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IOffice>,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case OfficeActionTypes.getAllManager: {
      return {
        ...state,
        managers: null,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case OfficeActionTypes.officeFind: {
      return {
        ...state,
        data: {} as IOffice,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case OfficeActionTypes.officeSuccess: {
      return {
        ...state,
        data: action.payload,
        managers: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case OfficeActionTypes.officeSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        selected: null,
        errorMessage: null,
        subErrors: null,
        isLoading: false
      };
    }
    case OfficeActionTypes.officeSelected: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case OfficeActionTypes.officeFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case OfficeActionTypes.officeUpdate:
    case OfficeActionTypes.officeSave:
    case OfficeActionTypes.officeDelete: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
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
