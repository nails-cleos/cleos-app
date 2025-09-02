import { Action } from '@ngrx/store';

export enum InvoiceActionTypes {
  findOfficeToInvoice = '[Invoice] Find office to invoice',
  getAllMyOffices = '[Invoice] Get all my offices',
  invoiceOfficesSuccess = '[Invoice] Offices success',
  invoiceSuccess = '[Invoice] Success',
  updateOfficeById = '[Invoice] Update office by Id',
  invoiceUpdateOfficeSuccess = '[Invoice] Update office Success',
  invoiceFailure = '[Invoice] Failure',
  clean = '[Invoice] Clean'
}

export class FindOfficeToInvoice implements Action {
  readonly type = InvoiceActionTypes.findOfficeToInvoice;

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

export class GetAllMyOffices implements Action {
  readonly type = InvoiceActionTypes.getAllMyOffices;
}

export class OfficesSuccess implements Action {
  readonly type = InvoiceActionTypes.invoiceOfficesSuccess;

  constructor(public payload: any) {
  }
}

export class UpdateOfficeById implements Action {
  readonly type = InvoiceActionTypes.updateOfficeById;

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
  | FindOfficeToInvoice
  | InvoiceSuccess
  | InvoiceFailure
  | GetAllMyOffices
  | OfficesSuccess
  | UpdateOfficeById
  | UpdateOfficesSuccess
  | Clean;
