import { Pagination } from '../../interfaces/pagination';
import {
  additionalFailure,
  additionalSaveSuccess,
  additionalSelected,
  additionalSuccess,
  clean,
  createAdditional,
  deleteAdditional,
  findGroupsSuccess,
  getAdditional,
  getAdditionalList,
  getAdditionalPage,
  getAllTreatmentsGroup,
  updateAdditional,
} from '../additional.actions';
import { IAdditional, IAdditionalAll } from '../../interfaces/additional';
import { ITreatmentGroup } from '../../interfaces/treatment';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';

export interface State {
  response?: IResponseSuccess;
  data?: Pagination<IAdditional> | IAdditionalAll[];
  groups?: ITreatmentGroup[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IAdditional;
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

export const additionalReducer = createReducer(
  initialState,
  on(getAdditionalPage, (state) => ({
    ...state,
    data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IAdditional>,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
  })),

  on(getAdditionalList, (state) => ({
    ...state,
    data: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),

  on(getAdditional, (state) => ({
    ...state,
    errorMessage: undefined,
    subErrors: undefined,
    selected: {} as IAdditional,
  })),

  on(additionalSuccess, (state, { data }) => ({
    ...state,
    data: data,
    errorMessage: undefined,
    subErrors: undefined,
  })),

  on(additionalSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    isLoading: false,
  })),

  on(additionalSelected, (state, { selected }) => ({
    ...state,
    selected: selected,
    errorMessage: undefined,
    subErrors: undefined,
  })),

  on(additionalFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    error: error,
    subErrors: error.subErrors,
    isLoading: false,
  })),

  on(updateAdditional, createAdditional, deleteAdditional, (state) => ({
    ...state,
    errorMessage: undefined,
    subErrors: undefined,
    isLoading: true,
  })),

  on(getAllTreatmentsGroup, (state) => ({
    ...state,
    groups: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),

  on(findGroupsSuccess, (state, { groups }) => ({
    ...state,
    groups: groups,
    errorMessage: undefined,
    subErrors: undefined,
  })),

  on(clean, () => initialState),
);
