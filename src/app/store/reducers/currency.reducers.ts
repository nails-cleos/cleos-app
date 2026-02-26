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
  setCurrentCurrencyId,
  updateCurrency,
} from '../currency.actions';
import { ICurrency } from '../../interfaces/currency';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';
import { clearGlobalError, clearGlobalResponse } from '../global.actions';

export const CURRENCY_FEATURE_KEY = 'currency';

export interface CurrencyState {
  response?: IResponseSuccess;
  data?: Pagination<ICurrency>;
  error?: IError;
  subErrors?: IError[];
  selected?: ICurrency;
  isLoading: boolean;
  currentCurrencyId?: string;
}

export const initialState: CurrencyState = {
  data: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
  currentCurrencyId: undefined,
};

export const currencyReducer = createReducer(
  initialState,
  on(getCurrenciesPage, (state) => ({
    ...state,
    data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<ICurrency>,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getCurrency, (state) => ({
    ...state,
    subErrors: undefined,
    selected: {} as ICurrency,
    response: undefined,
  })),
  on(currencySuccess, (state, { data }) => ({
    ...state,
    data: data,
    subErrors: undefined,
    response: undefined,
  })),
  on(currencySaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(currencySelected, (state, { selected }) => ({
    ...state,
    selected: selected,
    subErrors: undefined,
    response: undefined,
  })),
  on(currencyFailure, (state, { error }) => ({
    ...state,
    error: error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(updateCurrency, createCurrency, deleteCurrency, (state) => ({
    ...state,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
    selected: undefined,
  })),
  on(setCurrentCurrencyId, (state, { currencyId }) => ({
    ...state,
    currentCurrencyId: currencyId,
  })),
  on(clean, () => initialState),

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
