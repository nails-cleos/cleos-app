import { Pagination } from '../../interfaces/pagination';
import { createReducer, on } from '@ngrx/store';

import {
  clean,
  colorSuccess,
  createTreatment,
  deleteTreatmentGroup,
  getAllColors,
  getAllTreatmentsGroup,
  getAllTreatmentsHistory,
  getTreatmentGroup,
  getTreatmentsPage,
  treatmentFailure,
  treatmentHistorySuccess,
  treatmentSaveSuccess,
  treatmentSelected,
  treatmentSuccess,
  updateTreatmentGroup,
} from '../treatment.actions';
import { ITreatmentAll, ITreatmentGroup } from '../../interfaces/treatment';
import { IColor } from '../../interfaces/color';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: ITreatmentGroup[] | Pagination<ITreatmentGroup>;
  history?: ITreatmentAll[];
  colors?: IColor[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: ITreatmentGroup;
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  history: undefined,
  colors: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const treatmentReducer = createReducer(
  initialState,
  on(getTreatmentsPage, (state) => ({
    ...state,
    data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<ITreatmentGroup>,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllTreatmentsGroup, (state) => ({
    ...state,
    data: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllColors, (state) => ({
    ...state,
    colors: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(getTreatmentGroup, (state) => ({
    ...state,
    selected: {} as ITreatmentGroup,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(treatmentSuccess, (state, { data }) => ({
    ...state,
    data,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(colorSuccess, (state, { colors }) => ({
    ...state,
    colors,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(treatmentSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    errorMessage: undefined,
    selected: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(treatmentSelected, (state, { selected }) => ({
    ...state,
    selected,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(treatmentFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(updateTreatmentGroup, createTreatment, deleteTreatmentGroup, (state) => ({
    ...state,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
    selected: undefined,
    isLoading: true,
  })),
  on(getAllTreatmentsHistory, (state) => ({
    ...state,
    history: [{} as ITreatmentAll, {} as ITreatmentAll, {} as ITreatmentAll],
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(treatmentHistorySuccess, (state, { history }) => ({
    ...state,
    history,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(clean, () => initialState),
);
