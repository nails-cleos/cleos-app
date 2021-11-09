import { Pagination } from '../../interfaces/pagination';
import { All, AdditionalActionTypes } from '../additional.actions';
import { IAdditional } from '../../interfaces/additional';

export interface State {
  data: IAdditional | Pagination<IAdditional> | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IAdditional | null;
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
    case AdditionalActionTypes.getAll: {
      return {
        ...state,
        // @ts-ignore
        data: {content: [{}, {}, {}], totalElements: 3},
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case AdditionalActionTypes.additionalFind: {
      return {
        ...state,
        data: {} as IAdditional,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case AdditionalActionTypes.additionalSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case AdditionalActionTypes.additionalSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        selected: null,
        errorMessage: null,
        subErrors: null,
        isLoading: false
      };
    }
    case AdditionalActionTypes.additionalSelected: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case AdditionalActionTypes.additionalFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case AdditionalActionTypes.additionalUpdate:
    case AdditionalActionTypes.additionalSave:
    case AdditionalActionTypes.additionalDelete: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case AdditionalActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
