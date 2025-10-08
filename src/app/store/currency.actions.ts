import { Action } from '@ngrx/store';
import { IError, PageRequest, ResponseSuccess } from '../interfaces/common';
import { ICurrency } from '../interfaces/currency';
import { Pagination } from '../interfaces/pagination';

export enum CurrencyActionTypes {
  getCurrenciesPage = '[Currency] Get currencies page',
  currencySuccess = '[Currency] Success',
  createCurrency = '[Currency] Create currency',
  updateCurrency = '[Currency] Update currency by id',
  currencySaveSuccess = '[Currency] Save Success',
  currencyFailure = '[Currency] Failure',
  currencySelected = '[Currency] Selected',
  getCurrency = '[Currency] Find currency by id',
  deleteCurrency = '[Currency] Delete currency by id',
  clean = '[Currency] Clean'
}

export class GetCurrenciesPage extends PageRequest implements Action {
  readonly type = CurrencyActionTypes.getCurrenciesPage;
}

export class CurrencySuccess implements Action {
  readonly type = CurrencyActionTypes.currencySuccess;

  constructor(public data: Pagination<ICurrency>) {
  }
}

export class CreateCurrency implements Action {
  readonly type = CurrencyActionTypes.createCurrency;

  constructor(public currency: ICurrency) {
  }
}

export class UpdateCurrency implements Action {
  readonly type = CurrencyActionTypes.updateCurrency;

  constructor(public id: string, public currency: ICurrency) {
  }
}

export class CurrencySaveSuccess extends ResponseSuccess implements Action {
  readonly type = CurrencyActionTypes.currencySaveSuccess;
}

export class CurrencyFailure implements Action {
  readonly type = CurrencyActionTypes.currencyFailure;

  constructor(public error: IError) {
  }
}

export class CurrencySelected implements Action {
  readonly type = CurrencyActionTypes.currencySelected;

  constructor(public selected?: ICurrency) {
  }
}

export class GetCurrency implements Action {
  readonly type = CurrencyActionTypes.getCurrency;

  constructor(public id: string) {
  }
}

export class DeleteCurrency implements Action {
  readonly type = CurrencyActionTypes.deleteCurrency;

  constructor(public id: string, public code: string) {
  }
}

export class Clean implements Action {
  readonly type = CurrencyActionTypes.clean;
}

export type All =
  | GetCurrenciesPage
  | CreateCurrency
  | UpdateCurrency
  | CurrencySuccess
  | CurrencySaveSuccess
  | CurrencyFailure
  | GetCurrency
  | CurrencySelected
  | DeleteCurrency
  | Clean;
