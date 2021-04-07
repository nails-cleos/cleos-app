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

export function reducer(state = initialState, action: All): State {
  switch (action.type) {
    case CatalogueActionTypes.GET_ALL: {
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
    case CatalogueActionTypes.CATALOGUE_FIND: {
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
    case CatalogueActionTypes.CATALOGUE_SUCCESS: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case CatalogueActionTypes.CATALOGUE_SAVE_SUCCESS: {
      return {
        ...state,
        message: action.payload.message,
        errorMessage: null,
        subErrors: null,
        isLoading: false
      };
    }
    case CatalogueActionTypes.CATALOGUE_SELECTED: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case CatalogueActionTypes.CATALOGUE_FAILURE: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case CatalogueActionTypes.CATALOGUE_UPDATE_ALL: {
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
    case CatalogueActionTypes.CATALOGUE_UPDATE:
    case CatalogueActionTypes.CATALOGUE_SAVE:
    case CatalogueActionTypes.CATALOGUE_DELETE: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case CatalogueActionTypes.CLEAN: {
      return initialState;
    }
    default: {
      return state;
    }
  }
}
