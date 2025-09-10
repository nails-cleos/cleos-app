import { Pagination } from '../../interfaces/pagination';
import { All, ColorActionTypes } from '../color.actions';
import { IColor } from '../../interfaces/color';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: Pagination<IColor>;
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IColor;
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case ColorActionTypes.getColorsPage: {
      return {
        ...state,
        data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IColor>,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case ColorActionTypes.getColor: {
      return {
        ...state,
        errorMessage: undefined,
        subErrors: undefined,
        selected: {} as IColor,
        response: undefined,
      };
    }
    case ColorActionTypes.colorSuccess: {
      return {
        ...state,
        data: action.data,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ColorActionTypes.colorSaveSuccess: {
      return {
        ...state,
        response: action,
        selected: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: false,
      };
    }
    case ColorActionTypes.colorSelected: {
      return {
        ...state,
        selected: action.selected,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ColorActionTypes.colorFailure: {
      return {
        ...state,
        errorMessage: action.error.message,
        error: action.error,
        subErrors: action.error.subErrors,
        response: undefined,
        isLoading: false,
      };
    }
    case ColorActionTypes.updateColor:
    case ColorActionTypes.createColor:
    case ColorActionTypes.deleteColor: {
      return {
        ...state,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
        isLoading: true,
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
