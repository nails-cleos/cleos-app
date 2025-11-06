import { createReducer, on } from '@ngrx/store';
import { Pagination } from '../../interfaces/pagination';
import { ICatalogue } from '../../interfaces/catalogue';
import { ITreatmentGroup } from '../../interfaces/treatment';
import { IError, IResponseSuccess } from '../../interfaces/common';
import {
  catalogueFailure,
  catalogueSaveSuccess,
  catalogueSelected,
  catalogueSuccess,
  clean,
  createCatalogue,
  deleteCatalogue,
  findGroupsSuccess,
  getAllCatalogs,
  getAllCatalogues,
  getAllTreatmentsGroup,
  getCatalogue,
  updateCatalogue,
  updateCatalogueOrder,
} from '../catalogue.actions';

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

export const catalogueReducer = createReducer(
  initialState,
  on(
    getAllCatalogues,
    getAllCatalogs,
    (state) => ({
      ...state,
      data: [{}, {}, {}],
      response: undefined,
      errorMessage: undefined,
      subErrors: undefined,
      selected: undefined,
    }),
  ),
  on(getCatalogue, (state) => ({
    ...state,
    selected: {} as ICatalogue,
    response: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),
  on(catalogueSuccess, (state, { data }) => ({
    ...state,
    data,
    response: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),
  on(catalogueSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(catalogueSelected, (state, { selected }) => ({
    ...state,
    selected,
    response: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),
  on(catalogueFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(updateCatalogueOrder, (state) => ({
    ...state,
    data: [{}, {}, {}],
    response: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),
  on(
    createCatalogue,
    updateCatalogue,
    deleteCatalogue,
    (state) => ({
      ...state,
      response: undefined,
      errorMessage: undefined,
      subErrors: undefined,
      isLoading: true,
    }),
  ),
  on(getAllTreatmentsGroup, (state) => ({
    ...state,
    response: undefined,
    groups: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),
  on(findGroupsSuccess, (state, { groups }) => ({
    ...state,
    groups,
    response: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),
  on(clean, () => initialState),
);
