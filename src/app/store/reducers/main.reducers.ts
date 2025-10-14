import {
  catalogueSuccess,
  clean,
  getAllCatalogue,
  getListTreatmentsGroup,
  requestFailure,
  requestSuccess,
  sendMessage,
  treatmentSuccess,
  updateMyUser,
} from '../main.actions';
import { ICatalogue } from '../../interfaces/catalogue';
import { ITreatmentGroup } from '../../interfaces/treatment';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';

export interface State {
  response?: IResponseSuccess;
  catalogue?: ICatalogue[];
  groups?: ITreatmentGroup[];
  errorMessage?: string;
  error?: IError;
  isLoading: boolean;
}

export const initialState: State = {
  catalogue: undefined,
  groups: undefined,
  errorMessage: undefined,
  error: undefined,
  response: undefined,
  isLoading: false,
};

export const mainReducer = createReducer(
  initialState,
  on(getAllCatalogue, (state) => ({
    ...state,
    catalogue: [{}, {}, {}],
    errorMessage: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(getListTreatmentsGroup, (state) => ({
    ...state,
    groups: undefined,
    errorMessage: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(updateMyUser, sendMessage, (state) => ({
    ...state,
    errorMessage: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(catalogueSuccess, (state, { catalogues }) => ({
    ...state,
    catalogue: catalogues,
    errorMessage: undefined,
    response: undefined,
    isLoading: false,
  })),
  on(treatmentSuccess, (state, { groups }) => ({
    ...state,
    groups: groups,
    errorMessage: undefined,
    response: undefined,
    isLoading: false,
  })),
  on(requestSuccess, (state, action) => ({
    ...state,
    response: action,
    errorMessage: undefined,
    isLoading: false,
  })),
  on(requestFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    error: error,
    response: undefined,
    isLoading: false,
  })),
  on(clean, () => initialState),
);
