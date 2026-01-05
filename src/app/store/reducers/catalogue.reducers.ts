import { createReducer, on } from '@ngrx/store';
import { ICatalogueAll } from '../../interfaces/catalogue';
import { ITreatmentGroupAll } from '../../interfaces/treatment';
import { IError, IResponseSuccess } from '../../interfaces/common';
import {
  catalogueFailure,
  catalogueSaveSuccess,
  catalogueSelected,
  catalogueSuccess,
  cleanCatalogue,
  createCatalogue,
  deleteCatalogue,
  findGroupsSuccess,
  getAllCatalogs,
  getAllCatalogues,
  getAllTreatmentsGroup,
  getCatalogue,
  setCurrentCatalogueId,
  updateCatalogue,
  updateCatalogueOrder,
} from '../catalogue.actions';

export const CATALOGUE_FEATURE_KEY = 'catalogue';

export interface CatalogueState {
  response?: IResponseSuccess;
  data?: ICatalogueAll[];
  groups?: ITreatmentGroupAll[];
  error?: IError;
  subErrors?: IError[];
  selected?: ICatalogueAll;
  isLoading: boolean;
  currentCatalogueId?: string;
}

export const initialState: CatalogueState = {
  response: undefined,
  data: undefined,
  groups: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  isLoading: false,
  currentCatalogueId: undefined,
};

export const catalogueReducer = createReducer(
  initialState,
  on(
    getAllCatalogues,
    getAllCatalogs,
    (state) => ({
      ...state,
      data: [{} as ICatalogueAll, {} as ICatalogueAll, {} as ICatalogueAll],
      response: undefined,
      subErrors: undefined,
      selected: undefined,
    }),
  ),
  on(getCatalogue, (state) => ({
    ...state,
    selected: {} as ICatalogueAll,
    response: undefined,
    subErrors: undefined,
  })),
  on(catalogueSuccess, (state, { data }) => ({
    ...state,
    data,
    response: undefined,
    subErrors: undefined,
  })),
  on(catalogueSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(catalogueSelected, (state, { selected }) => ({
    ...state,
    selected,
    response: undefined,
    subErrors: undefined,
  })),
  on(catalogueFailure, (state, { error }) => ({
    ...state,
    error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(updateCatalogueOrder, (state) => ({
    ...state,
    data: [{} as ICatalogueAll, {} as ICatalogueAll, {} as ICatalogueAll],
    response: undefined,
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
      selected: undefined,
    }),
  ),
  on(getAllTreatmentsGroup, (state) => ({
    ...state,
    response: undefined,
    groups: undefined,
    subErrors: undefined,
  })),
  on(findGroupsSuccess, (state, { groups }) => ({
    ...state,
    groups,
    response: undefined,
    subErrors: undefined,
  })),

  on(setCurrentCatalogueId, (state, { catalogueId }) => ({
    ...state,
    currentCatalogueId: catalogueId,
  })),
  on(cleanCatalogue, () => initialState),
);
