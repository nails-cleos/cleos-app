import { Pagination } from '../../interfaces/pagination';
import {
  clean,
  createCurrency,
  currencyFailure,
  currencySaveSuccess,
  currencySelected,
  currencySuccess,
  deleteCurrency,
  getCurrenciesPage,
  getCurrency,
  updateCurrency,
} from '../currency.actions';
import { ICurrency } from '../../interfaces/currency';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';

export interface State {
  response?: IResponseSuccess;
  data?: Pagination<ICurrency>;
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: ICurrency;
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const currencyReducer = createReducer(
  initialState,
  on(getCurrenciesPage, (state) => ({
    ...state,
    data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<ICurrency>,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getCurrency, (state) => ({
    ...state,
    errorMessage: undefined,
    subErrors: undefined,
    selected: {} as ICurrency,
    response: undefined,
  })),
  on(currencySuccess, (state, { data }) => ({
    ...state,
    data: data,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(currencySaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(currencySelected, (state, { selected }) => ({
    ...state,
    selected: selected,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(currencyFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    error: error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(updateCurrency, createCurrency, deleteCurrency, (state) => ({
    ...state,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(clean, () => initialState),
);
