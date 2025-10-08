import { Pagination } from '../../interfaces/pagination';
import { All, CatalogueActionTypes } from '../catalogue.actions';
import { ICatalogue } from '../../interfaces/catalogue';
import { ITreatmentGroup } from '../../interfaces/treatment';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: ICatalogue[] | Pagination<ICatalogue>;
  groups?: ITreatmentGroup[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: ICatalogue;
  isLoading: boolean;
}

export const initialState: State = {
  response: undefined,
  data: undefined,
  groups: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case CatalogueActionTypes.getAllCatalogs:
    case CatalogueActionTypes.getAllCatalogues: {
      return {
        ...state,
        data: [{}, {}, {}],
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
      };
    }
    case CatalogueActionTypes.getCatalogue: {
      return {
        ...state,
        selected: {} as ICatalogue,
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case CatalogueActionTypes.catalogueSuccess: {
      return {
        ...state,
        data: action.data,
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case CatalogueActionTypes.catalogueSaveSuccess: {
      return {
        ...state,
        response: action,
        selected: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: false,
      };
    }
    case CatalogueActionTypes.catalogueSelected: {
      return {
        ...state,
        selected: action.selected,
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case CatalogueActionTypes.catalogueFailure: {
      return {
        ...state,
        errorMessage: action.error.message,
        error: action.error,
        subErrors: action.error.subErrors,
        response: undefined,
        isLoading: false,
      };
    }
    case CatalogueActionTypes.updateCatalogueOrder: {
      return {
        ...state,
        data: [{}, {}, {}],
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case CatalogueActionTypes.updateCatalogue:
    case CatalogueActionTypes.createCatalogue:
    case CatalogueActionTypes.deleteCatalogue: {
      return {
        ...state,
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: true,
      };
    }
    case CatalogueActionTypes.getAllTreatmentsGroup: {
      return {
        ...state,
        response: undefined,
        groups: undefined,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case CatalogueActionTypes.findGroupsSuccess: {
      return {
        ...state,
        groups: action.groups,
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
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
