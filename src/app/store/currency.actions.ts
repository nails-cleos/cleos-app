import { createAction, props } from '@ngrx/store';
import { IError, IResponseSuccess, PageRequest } from '../interfaces/common';
import { ICurrency } from '../interfaces/currency';
import { Pagination } from '../interfaces/pagination';

enum CurrencyActionTypes {
  getCurrenciesPage = '[Currency] Get currencies page',
  currencySuccess = '[Currency] Success',
  createCurrency = '[Currency] Create currency',
  updateCurrency = '[Currency] Update currency by id',
  currencySaveSuccess = '[Currency] Save Success',
  currencyFailure = '[Currency] Failure',
  currencySelected = '[Currency] Selected',
  getCurrency = '[Currency] Find currency by id',
  deleteCurrency = '[Currency] Delete currency by id',
  setCurrentCurrencyId = '[Currency] Set current currency id',
  clean = '[Currency] Clean'
}

export const setCurrentCurrencyId = createAction(
  CurrencyActionTypes.setCurrentCurrencyId,
  props<{ currencyId: string }>(),
);

export const getCurrenciesPage = createAction(
  CurrencyActionTypes.getCurrenciesPage,
  props<PageRequest>(),
);

export const currencySuccess = createAction(
  CurrencyActionTypes.currencySuccess,
  props<{ data: Pagination<ICurrency> }>(),
);

export const createCurrency = createAction(
  CurrencyActionTypes.createCurrency,
  props<{ currency: ICurrency }>(),
);

export const updateCurrency = createAction(
  CurrencyActionTypes.updateCurrency,
  props<{ id: string; currency: ICurrency }>(),
);

export const currencySaveSuccess = createAction(
  CurrencyActionTypes.currencySaveSuccess,
  props<IResponseSuccess>(),
);

export const currencyFailure = createAction(
  CurrencyActionTypes.currencyFailure,
  props<{ error: IError }>(),
);

export const currencySelected = createAction(
  CurrencyActionTypes.currencySelected,
  props<{ selected?: ICurrency }>(),
);

export const getCurrency = createAction(
  CurrencyActionTypes.getCurrency,
  props<{ id: string }>(),
);

export const deleteCurrency = createAction(
  CurrencyActionTypes.deleteCurrency,
  props<{ id: string; code: string }>(),
);

export const clean = createAction(
  CurrencyActionTypes.clean,
);
