import { createReducer, on } from '@ngrx/store';
import { Pagination } from '../../interfaces/pagination';
import {
  cleanOffice,
  createOffice,
  deleteOffice,
  getAllManager,
  getAllMyOffices,
  getOffice,
  getOfficesPage,
  managerSuccess,
  officeFailure,
  officeSaveSuccess,
  officeSelected,
  officeSuccess,
  updateOffice,
} from '../office.actions';
import { IOffice, IOfficeAll } from '../../interfaces/office';
import { IUserAll } from '../../interfaces/user';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { clearGlobalError, clearGlobalResponse } from '../global.actions';

export const OFFICE_FEATURE_KEY = 'office';

export type OfficeData =
  | { kind: 'pagination'; value: Pagination<IOfficeAll> }
  | { kind: 'list'; value: IOfficeAll[] };

export interface OfficeState {
  response?: IResponseSuccess;
  data?: OfficeData;
  managers?: IUserAll[];
  error?: IError;
  subErrors?: IError[];
  selected?: IOffice;
  isLoading: boolean;
}

export const initialState: OfficeState = {
  data: undefined,
  managers: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const officeReducer = createReducer(
  initialState,
  on(getOfficesPage, (state) => ({
    ...state,
    data: {
      kind: 'pagination',
      value: {
        content: [{}, {}, {}],
        totalElements: 3,
      } as Pagination<IOfficeAll>,
    },
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllManager, (state) => ({
    ...state,
    managers: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getOffice, (state) => ({
    ...state,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(officeSuccess, (state, { data }) => ({
    ...state,
    data,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(managerSuccess, (state, { managers }) => ({
    ...state,
    managers,
    subErrors: undefined,
    response: undefined,
  })),
  on(officeSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(officeSelected, (state, { selected }) => ({
    ...state,
    selected,
    subErrors: undefined,
    response: undefined,
  })),
  on(officeFailure, (state, { error }) => ({
    ...state,
    error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(updateOffice, createOffice, deleteOffice, (state) => ({
    ...state,
    selected: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(getAllMyOffices, (state) => ({
    ...state,
    data: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(cleanOffice, () => initialState),

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
