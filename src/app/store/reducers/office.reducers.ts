import { createReducer, on } from '@ngrx/store';
import { Pagination } from '../../interfaces/pagination';
import {
  clean,
  createOffice,
  deleteOffice,
  getAllManager,
  getOffice,
  getOfficesPage,
  managerSuccess,
  officeFailure,
  officeSaveSuccess,
  officeSelected,
  officeSuccess,
  updateOffice,
} from '../office.actions';
import { IOffice } from '../../interfaces/office';
import { IUser } from '../../interfaces/user';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: IOffice | Pagination<IOffice>;
  managers?: IUser[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IOffice;
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  managers: undefined,
  errorMessage: undefined,
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
    data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IOffice>,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllManager, (state) => ({
    ...state,
    managers: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getOffice, (state) => ({
    ...state,
    data: {} as IOffice,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(officeSuccess, (state, { data }) => ({
    ...state,
    data,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(managerSuccess, (state, { managers }) => ({
    ...state,
    managers,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(officeSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(officeSelected, (state, { selected }) => ({
    ...state,
    selected,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(officeFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(updateOffice, createOffice, deleteOffice, (state) => ({
    ...state,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(clean, () => initialState),
);
