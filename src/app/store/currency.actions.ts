import { Action } from '@ngrx/store';

export enum CurrencyActionTypes {
  getCurrenciesPage = '[Currency] Get currencies page',
  currencySuccess = '[Currency] Success',
  createCurrency = '[Currency] Create currency',
  updateCurrencyById = '[Currency] Update currency by id',
  currencySaveSuccess = '[Currency] Save Success',
  currencyFailure = '[Currency] Failure',
  currencySelected = '[Currency] Selected',
  findCurrencyById = '[Currency] Find currency by id',
  deleteCurrencyById = '[Currency] Delete currency by id',
  clean = '[Currency] Clean'
}

export class GetCurrenciesPage implements Action {
  readonly type = CurrencyActionTypes.getCurrenciesPage;

  constructor(public payload: any) {
  }
}

export class CurrencySuccess implements Action {
  readonly type = CurrencyActionTypes.currencySuccess;

  constructor(public payload: any) {
  }
}

export class CreateCurrency implements Action {
  readonly type = CurrencyActionTypes.createCurrency;

  constructor(public payload: any) {
  }
}

export class UpdateCurrencyById implements Action {
  readonly type = CurrencyActionTypes.updateCurrencyById;

  constructor(public payload: any) {
  }
}

export class CurrencySaveSuccess implements Action {
  readonly type = CurrencyActionTypes.currencySaveSuccess;

  constructor(public payload: any) {
  }
}

export class CurrencyFailure implements Action {
  readonly type = CurrencyActionTypes.currencyFailure;

  constructor(public payload: any) {
  }
}

export class CurrencySelected implements Action {
  readonly type = CurrencyActionTypes.currencySelected;

  constructor(public payload: any) {
  }
}

export class FindCurrencyById implements Action {
  readonly type = CurrencyActionTypes.findCurrencyById;

  constructor(public payload: any) {
  }
}

export class DeleteCurrencyById implements Action {
  readonly type = CurrencyActionTypes.deleteCurrencyById;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = CurrencyActionTypes.clean;
}

export type All =
  | GetCurrenciesPage
  | CreateCurrency
  | UpdateCurrencyById
  | CurrencySuccess
  | CurrencySaveSuccess
  | CurrencyFailure
  | FindCurrencyById
  | CurrencySelected
  | DeleteCurrencyById
  | Clean;
