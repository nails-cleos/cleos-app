import { Pagination } from '../../interfaces/pagination';
import { All, CatalogueActionTypes } from '../catalogue.actions';
import { ICatalogue } from '../../interfaces/catalogue';

export interface State {
  data: ICatalogue | Pagination<ICatalogue> | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: ICatalogue | null;
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
    case CatalogueActionTypes.getAll: {
      return {
        ...state,
        // @ts-ignore
        data: [{}, {}, {}],
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case CatalogueActionTypes.catalogueFind: {
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
    case CatalogueActionTypes.catalogueSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case CatalogueActionTypes.catalogueSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        errorMessage: null,
        subErrors: null,
        isLoading: false
      };
    }
    case CatalogueActionTypes.catalogueSelected: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case CatalogueActionTypes.catalogueFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case CatalogueActionTypes.catalogueUpdateAll: {
      return {
        ...state,
        // @ts-ignore
        data: [{}, {}, {}],
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case CatalogueActionTypes.catalogueUpdate:
    case CatalogueActionTypes.catalogueSave:
    case CatalogueActionTypes.catalogueDelete: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case CatalogueActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
