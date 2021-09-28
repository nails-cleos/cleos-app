import { All, MainActionTypes } from '../main.actions';
import { ICatalogue } from '../../interfaces/catalogue';
import { IProduct, IProductGroup } from '../../interfaces/product';

export interface State {
  catalogue: ICatalogue[] | null;
  groups: IProductGroup[] | null;
  errorMessage: string | null;
  error: any;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  catalogue: null,
  groups: null,
  errorMessage: null,
  error: null,
  message: null,
  isLoading: false
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case MainActionTypes.getAllCatalogue: {
      return {
        ...state,
        // @ts-ignore
        catalogue: [{}, {}, {}],
        errorMessage: null,
        message: null,
        isLoading: true
      };
    }
    case MainActionTypes.getAllProducts: {
      return {
        ...state,
        groups: null,
        errorMessage: null,
        message: null,
        isLoading: true
      };
    }
    case MainActionTypes.sendMessage: {
      return {
        ...state,
        errorMessage: null,
        message: null,
        isLoading: true
      };
    }
    case MainActionTypes.catalogueSuccess: {
      return {
        ...state,
        catalogue: action.payload,
        errorMessage: null,
        message: null,
        isLoading: false
      };
    }
    case MainActionTypes.productSuccess: {
      return {
        ...state,
        groups: action.payload,
        errorMessage: null,
        message: null,
        isLoading: false
      };
    }
    case MainActionTypes.requestSuccess: {
      return {
        ...state,
        message: action.payload.message,
        errorMessage: null,
        isLoading: false
      };
    }
    case MainActionTypes.requestFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        message: null,
        isLoading: false
      };
    }
    case MainActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
