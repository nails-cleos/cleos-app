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

export function reducer(state = initialState, action: All): State {
  switch (action.type) {
    case ProductActionTypes.GET_ALL: {
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
    case ProductActionTypes.PRODUCT_FIND: {
      return {
        ...state,
        // @ts-ignore
        data: {},
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case ProductActionTypes.PRODUCT_SUCCESS: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case ProductActionTypes.PRODUCT_SAVE_SUCCESS: {
      return {
        ...state,
        message: action.payload.message,
        errorMessage: null,
        subErrors: null,
        isLoading: false
      };
    }
    case ProductActionTypes.PRODUCT_SELECTED: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case ProductActionTypes.PRODUCT_FAILURE: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case ProductActionTypes.PRODUCT_UPDATE:
    case ProductActionTypes.PRODUCT_SAVE:
    case ProductActionTypes.PRODUCT_DELETE: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case ProductActionTypes.CLEAN: {
      return initialState;
    }
    default: {
      return state;
    }
  }
}
