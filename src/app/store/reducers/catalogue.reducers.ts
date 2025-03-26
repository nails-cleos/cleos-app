import { Pagination } from '../../interfaces/pagination';
import { All, CatalogueActionTypes } from '../catalogue.actions';
import { ICatalogue } from '../../interfaces/catalogue';
import { ITreatmentGroup } from '../../interfaces/treatment';

export interface State {
  data: ICatalogue | ICatalogue[] | Pagination<ICatalogue> | null;
  groups: ITreatmentGroup[] | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: ICatalogue | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  groups: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case CatalogueActionTypes.getAllCatalogs:
    case CatalogueActionTypes.getAll: {
      return {
        ...state,
        data: [{}, {}, {}],
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case CatalogueActionTypes.catalogueFind: {
      return {
        ...state,
        data: {} as ICatalogue,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case CatalogueActionTypes.catalogueSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case CatalogueActionTypes.catalogueSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        selected: null,
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
        message: null
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
        data: [{}, {}, {}],
        errorMessage: null,
        subErrors: null,
        message: null
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
    case CatalogueActionTypes.findGroups: {
      return {
        ...state,
        groups: null,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case CatalogueActionTypes.findGroupsSuccess: {
      return {
        ...state,
        groups: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
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
