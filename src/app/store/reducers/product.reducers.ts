import { Pagination } from '../../interfaces/pagination';
import { All, ProductActionTypes } from '../product.actions';
import { IProduct } from '../../interfaces/product';

export interface State {
  data: IProduct | Pagination<IProduct> | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IProduct | null;
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
    case ProductActionTypes.getAll: {
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
    case ProductActionTypes.productFind: {
      return {
        ...state,
        // @ts-ignore
        data: {},
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case ProductActionTypes.productSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case ProductActionTypes.productSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        errorMessage: null,
        selected: null,
        subErrors: null,
        isLoading: false
      };
    }
    case ProductActionTypes.productSelected: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case ProductActionTypes.productFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case ProductActionTypes.productUpdate:
    case ProductActionTypes.productSave:
    case ProductActionTypes.productDelete: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case ProductActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
