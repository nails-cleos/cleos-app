import { Action } from '@ngrx/store';
import { IError } from '../interfaces/common';
import { IInvoice } from '../interfaces/invoice';
import { IOffice } from '../interfaces/office';

export enum InvoiceActionTypes {
  getOfficeToInvoice = '[Invoice] Find office to invoice',
  getAllMyOffices = '[Invoice] Get all my offices',
  invoiceOfficesSuccess = '[Invoice] Offices success',
  invoiceSuccess = '[Invoice] Success',
  updateOfficeById = '[Invoice] Update office by Id',
  invoiceUpdateOfficeSuccess = '[Invoice] Update office Success',
  invoiceFailure = '[Invoice] Failure',
  clean = '[Invoice] Clean'
}

export class GetOfficeToInvoice implements Action {
  readonly type = InvoiceActionTypes.getOfficeToInvoice;

  constructor(public officeId: string, public start: string, public end: string, public types?: string[]) {
  }
}

export class InvoiceSuccess implements Action {
  readonly type = InvoiceActionTypes.invoiceSuccess;

  constructor(public data: IInvoice[]) {
  }
}

export class InvoiceFailure implements Action {
  readonly type = InvoiceActionTypes.invoiceFailure;

  constructor(public error: IError) {
  }
}

export class GetAllMyOffices implements Action {
  readonly type = InvoiceActionTypes.getAllMyOffices;
}

export class OfficesSuccess implements Action {
  readonly type = InvoiceActionTypes.invoiceOfficesSuccess;

  constructor(public offices: IOffice[]) {
  }
}

export class UpdateOfficeById implements Action {
  readonly type = InvoiceActionTypes.updateOfficeById;

  constructor(public id: string, public office: IOffice) {
  }
}

export class UpdateOfficesSuccess implements Action {
  readonly type = InvoiceActionTypes.invoiceUpdateOfficeSuccess;
}

export class Clean implements Action {
  readonly type = InvoiceActionTypes.clean;
}

export type All =
  | GetOfficeToInvoice
  | InvoiceSuccess
  | InvoiceFailure
  | GetAllMyOffices
  | OfficesSuccess
  | UpdateOfficeById
  | UpdateOfficesSuccess
  | Clean;
