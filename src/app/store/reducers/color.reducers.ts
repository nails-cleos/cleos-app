import { Pagination } from '../../interfaces/pagination';
import { All, ColorActionTypes } from '../color.actions';
import { IColor } from '../../interfaces/color';

export interface State {
  data: IColor | Pagination<IColor> | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IColor | null;
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
    case ColorActionTypes.getAll: {
      return {
        ...state,
        data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IColor>,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case ColorActionTypes.colorFind: {
      return {
        ...state,
        data: {} as IColor,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case ColorActionTypes.colorSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case ColorActionTypes.colorSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        selected: null,
        errorMessage: null,
        subErrors: null,
        isLoading: false
      };
    }
    case ColorActionTypes.colorSelected: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case ColorActionTypes.colorFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case ColorActionTypes.colorUpdate:
    case ColorActionTypes.colorSave:
    case ColorActionTypes.colorDelete: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case ColorActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
