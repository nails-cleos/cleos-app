import { Action } from '@ngrx/store';

export enum InvoiceActionTypes {
  invoiceFind = '[Invoice] Find',
  invoiceFindMyOffices = '[Invoice] Find my office',
  invoiceOfficesSuccess = '[Invoice] Offices success',
  invoiceSuccess = '[Invoice] Success',
  invoiceUpdateOffice = '[Invoice] Update office',
  invoiceUpdateOfficeSuccess = '[Invoice] Update office Success',
  invoiceFailure = '[Invoice] Failure',
  clean = '[Invoice] Clean'
}

export class InvoiceFind implements Action {
  readonly type = InvoiceActionTypes.invoiceFind;

  constructor(public payload: any) {
  }
}

export class InvoiceSuccess implements Action {
  readonly type = InvoiceActionTypes.invoiceSuccess;

  constructor(public payload: any) {
  }
}

export class InvoiceFailure implements Action {
  readonly type = InvoiceActionTypes.invoiceFailure;

  constructor(public payload: any) {
  }
}

export class FindMyOffices implements Action {
  readonly type = InvoiceActionTypes.invoiceFindMyOffices;
}

export class OfficesSuccess implements Action {
  readonly type = InvoiceActionTypes.invoiceOfficesSuccess;

  constructor(public payload: any) {
  }
}

export class UpdateOffices implements Action {
  readonly type = InvoiceActionTypes.invoiceUpdateOffice;

  constructor(public payload: any) {
  }
}

export class UpdateOfficesSuccess implements Action {
  readonly type = InvoiceActionTypes.invoiceUpdateOfficeSuccess;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = InvoiceActionTypes.clean;
}

export type All =
  | InvoiceFind
  | InvoiceSuccess
  | InvoiceFailure
  | FindMyOffices
  | OfficesSuccess
  | UpdateOffices
  | UpdateOfficesSuccess
  | Clean;
