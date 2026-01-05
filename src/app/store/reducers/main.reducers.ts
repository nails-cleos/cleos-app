import {
  catalogueSuccess,
  cleanMain,
  getAllCatalogue,
  getListTreatmentsGroup,
  requestFailure,
  requestSuccess,
  sendMessage,
  setCurrentLang,
  setCurrentTreatmentId,
  treatmentSuccess,
  updateMyUser,
} from '../main.actions';
import { ICatalogueAll } from '../../interfaces/catalogue';
import { ITreatmentGroup } from '../../interfaces/treatment';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';

export const MAIN_FEATURE_KEY = 'main';

export interface MainState {
  response?: IResponseSuccess;
  catalogue?: ICatalogueAll[];
  groups?: ITreatmentGroup[];
  error?: IError;
  currentTreatmentId?: string;
  currentLang?: string;
  isLoading: boolean;
}

export const initialState: MainState = {
  catalogue: undefined,
  groups: undefined,
  error: undefined,
  response: undefined,
  currentTreatmentId: undefined,
  currentLang: undefined,
  isLoading: false,
};

export const mainReducer = createReducer(
  initialState,
  on(getAllCatalogue, (state) => ({
    ...state,
    catalogue: [{} as ICatalogueAll, {} as ICatalogueAll, {} as ICatalogueAll],
    response: undefined,
    isLoading: true,
  })),
  on(getListTreatmentsGroup, (state) => ({
    ...state,
    groups: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(updateMyUser, sendMessage, (state) => ({
    ...state,
    response: undefined,
    isLoading: true,
  })),
  on(catalogueSuccess, (state, { catalogues }) => ({
    ...state,
    catalogue: catalogues,
    response: undefined,
    isLoading: false,
  })),
  on(treatmentSuccess, (state, { groups }) => ({
    ...state,
    groups: groups,
    response: undefined,
    isLoading: false,
  })),
  on(requestSuccess, (state, action) => ({
    ...state,
    response: action,
    isLoading: false,
  })),
  on(requestFailure, (state, { error }) => ({
    ...state,
    error: error,
    response: undefined,
    isLoading: false,
  })),
  on(setCurrentTreatmentId, (state, { treatmentId }) => ({
    ...state,
    currentTreatmentId: treatmentId,
  })),
  on(setCurrentLang, (state, { lang }) => ({
    ...state,
    currentLang: lang,
  })),
  on(cleanMain, () => initialState),
);
