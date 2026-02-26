import { Pagination } from '../../interfaces/pagination';
import {
  additionalFailure,
  additionalSaveSuccess,
  additionalSelected,
  additionalSuccess,
  cleanAdditional,
  createAdditional,
  deleteAdditional,
  findGroupsSuccess,
  getAdditional,
  getAdditionalList,
  getAdditionalPage,
  getAllTreatmentsGroup,
  setCurrentAdditionalId,
  sortAdditional,
  updateAdditional,
} from '../additional.actions';
import { IAdditional, IAdditionalAll } from '../../interfaces/additional';
import { ITreatmentGroupAll } from '../../interfaces/treatment';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';
import { clearGlobalError, clearGlobalResponse } from '../global.actions';

export const ADDITIONAL_FEATURE_KEY = 'additional';

export type AdditionalData =
  | { kind: 'pagination'; value?: Pagination<IAdditionalAll> }
  | { kind: 'list'; value?: IAdditionalAll[] };

export interface AdditionalState {
  response?: IResponseSuccess;
  data?: AdditionalData;
  groups?: ITreatmentGroupAll[];
  error?: IError;
  subErrors?: IError[];
  selected?: IAdditional;
  isLoading: boolean;
  currentAdditionalId?: string;
}

export const initialState: AdditionalState = {
  response: undefined,
  data: undefined,
  groups: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  isLoading: false,
  currentAdditionalId: undefined,
};

export const additionalReducer = createReducer(
  initialState,
  on(getAdditionalPage, (state) => ({
    ...state,
    data: {
      kind: 'pagination',
      value: {
        content: [{}, {}, {}],
        totalElements: 3,
      } as Pagination<IAdditionalAll>,
    },
    subErrors: undefined,
    selected: undefined,
  })),

  on(getAdditionalList, (state) => ({
    ...state,
    data: undefined,
    subErrors: undefined,
  })),

  on(getAdditional, (state) => ({
    ...state,
    subErrors: undefined,
    selected: {} as IAdditional,
  })),

  on(additionalSuccess, (state, { data }) => ({
    ...state,
    data,
    subErrors: undefined,
    isLoading: false,
  })),

  on(additionalSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    subErrors: undefined,
    isLoading: false,
  })),

  on(additionalSelected, (state, { selected }) => ({
    ...state,
    selected: selected,
    subErrors: undefined,
    isLoading: false,
  })),

  on(additionalFailure, (state, { error }) => ({
    ...state,
    error: error,
    subErrors: error.subErrors,
    isLoading: false,
  })),

  on(updateAdditional, createAdditional, deleteAdditional, (state) => ({
    ...state,
    subErrors: undefined,
    isLoading: true,
    data: undefined,
  })),

  on(getAllTreatmentsGroup, (state) => ({
    ...state,
    groups: undefined,
    subErrors: undefined,
  })),

  on(findGroupsSuccess, (state, { groups }) => ({
    ...state,
    groups,
    subErrors: undefined,
  })),

  on(sortAdditional, (state) => ({
    ...state,
    subErrors: undefined,
    isLoading: true,
    data: undefined,
  })),

  on(setCurrentAdditionalId, (state, { additionalId }) => ({
    ...state,
    currentAdditionalId: additionalId,
  })),

  on(cleanAdditional, () => initialState),

  on(clearGlobalResponse, (state) => ({
    ...state,
    response: undefined,
  })),

  on(clearGlobalError, (state) => ({
    ...state,
    error: undefined,
    subErrors: undefined,
  })),
);
