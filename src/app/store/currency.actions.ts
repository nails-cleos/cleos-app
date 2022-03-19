import { Action } from '@ngrx/store';

export enum CurrencyActionTypes {
  getAll = '[Currency] Get all',
  currencySuccess = '[Currency] Success',
  currencySave = '[Currency] Save',
  currencyUpdate = '[Currency] Update',
  currencySaveSuccess = '[Currency] Save Success',
  currencyFailure = '[Currency] Failure',
  currencySelected = '[Currency] Selected',
  currencyFind = '[Currency] Find',
  currencyDelete = '[Currency] Delete',
  clean = '[Currency] Clean'
}

export class GetAll implements Action {
  readonly type = CurrencyActionTypes.getAll;

  constructor(public payload: any) {
  }
}

export class CurrencySuccess implements Action {
  readonly type = CurrencyActionTypes.currencySuccess;

  constructor(public payload: any) {
  }
}

export class CurrencySave implements Action {
  readonly type = CurrencyActionTypes.currencySave;

  constructor(public payload: any) {
  }
}

export class CurrencyUpdate implements Action {
  readonly type = CurrencyActionTypes.currencyUpdate;

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

export class CurrencyFind implements Action {
  readonly type = CurrencyActionTypes.currencyFind;

  constructor(public payload: any) {
  }
}

export class DeleteCurrency implements Action {
  readonly type = CurrencyActionTypes.currencyDelete;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = CurrencyActionTypes.clean;
}

export type All =
  | GetAll
  | CurrencySave
  | CurrencyUpdate
  | CurrencySuccess
  | CurrencySaveSuccess
  | CurrencyFailure
  | CurrencyFind
  | CurrencySelected
  | DeleteCurrency
  | Clean;
