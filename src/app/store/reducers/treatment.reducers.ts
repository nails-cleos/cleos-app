import { Pagination } from '../../interfaces/pagination';
import { createReducer, on } from '@ngrx/store';

import {
  cleanTreatment,
  colorSuccess,
  createTreatment,
  deleteTreatmentGroup,
  getAllColors,
  getAllTreatmentsGroup,
  getAllTreatmentsHistory,
  getTreatmentGroup,
  getTreatmentsPage,
  setCurrentTreatmentId,
  sortTreatment,
  treatmentFailure,
  treatmentHistorySuccess,
  treatmentSaveSuccess,
  treatmentSelected,
  treatmentSuccess,
  updateTreatmentGroup,
} from '../treatment.actions';
import { ITreatmentAll, ITreatmentGroupAll } from '../../interfaces/treatment';
import { IColorAll } from '../../interfaces/color';
import { IError, IResponseSuccess } from '../../interfaces/common';

export const TREATMENT_FEATURE_KEY = 'treatment';

export interface TreatmentState {
  response?: IResponseSuccess;
  data?: ITreatmentGroupAll[] | Pagination<ITreatmentGroupAll>;
  history?: ITreatmentAll[];
  colors?: IColorAll[];
  error?: IError;
  subErrors?: IError[];
  selected?: ITreatmentGroupAll;
  currentTreatmentId?: string;
  isLoading: boolean;
}

export const initialState: TreatmentState = {
  data: undefined,
  history: undefined,
  colors: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  currentTreatmentId: undefined,
  isLoading: false,
};

export const treatmentReducer = createReducer(
  initialState,
  on(getTreatmentsPage, (state) => ({
    ...state,
    data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<ITreatmentGroupAll>,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllTreatmentsGroup, (state) => ({
    ...state,
    data: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllColors, (state) => ({
    ...state,
    colors: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(getTreatmentGroup, (state) => ({
    ...state,
    selected: {} as ITreatmentGroupAll,
    subErrors: undefined,
    response: undefined,
  })),
  on(treatmentSuccess, (state, { data }) => ({
    ...state,
    data,
    subErrors: undefined,
    response: undefined,
  })),
  on(colorSuccess, (state, { colors }) => ({
    ...state,
    colors,
    subErrors: undefined,
    response: undefined,
  })),
  on(treatmentSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(treatmentSelected, (state, { selected }) => ({
    ...state,
    selected,
    subErrors: undefined,
    response: undefined,
  })),
  on(treatmentFailure, (state, { error }) => ({
    ...state,
    error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(updateTreatmentGroup, createTreatment, deleteTreatmentGroup, (state) => ({
    ...state,
    subErrors: undefined,
    response: undefined,
    selected: undefined,
    isLoading: true,
  })),
  on(getAllTreatmentsHistory, (state) => ({
    ...state,
    history: [{} as ITreatmentAll, {} as ITreatmentAll, {} as ITreatmentAll],
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(treatmentHistorySuccess, (state, { history }) => ({
    ...state,
    history,
    subErrors: undefined,
    response: undefined,
  })),
  on(sortTreatment, (state) => ({
    ...state,
    selected: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(setCurrentTreatmentId, (state, { treatmentId }) => ({
    ...state,
    currentTreatmentId: treatmentId,
  })),
  on(cleanTreatment, () => initialState),
);
