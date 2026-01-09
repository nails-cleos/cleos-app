import { createAction, props } from '@ngrx/store';
import { IError, IResponseSuccess } from '../interfaces/common';
import { IInvoice } from '../interfaces/invoice';
import { IOffice, IOfficeAll } from '../interfaces/office';

enum InvoiceActionTypes {
  getOfficeToInvoice = '[Invoice] Find office to invoice',
  getAllMyOffices = '[Invoice] Get all my offices',
  invoiceOfficesSuccess = '[Invoice] Offices success',
  invoiceSuccess = '[Invoice] Success',
  updateOfficeById = '[Invoice] Update office by id',
  invoiceUpdateOfficeSuccess = '[Invoice] Update office Success',
  uploadInvoices = '[Invoice] Upload invoices',
  invoiceSaveSuccess = '[Invoice] Save Success',
  invoiceFailure = '[Invoice] Failure',
  clean = '[Invoice] Clean'
}

export const getOfficeToInvoice = createAction(
  InvoiceActionTypes.getOfficeToInvoice,
  props<{ officeId: string, start: string, end: string, types?: string[] }>(),
);

export const invoiceSuccess = createAction(
  InvoiceActionTypes.invoiceSuccess,
  props<{ data: IInvoice[] }>(),
);

export const invoiceFailure = createAction(
  InvoiceActionTypes.invoiceFailure,
  props<{ error: IError }>(),
);

export const getAllMyOffices = createAction(
  InvoiceActionTypes.getAllMyOffices,
);

export const invoiceOfficesSuccess = createAction(
  InvoiceActionTypes.invoiceOfficesSuccess,
  props<{ offices: IOfficeAll[] }>(),
);

export const updateOfficeById = createAction(
  InvoiceActionTypes.updateOfficeById,
  props<{ id: string, office: IOffice }>(),
);

export const uploadInvoices = createAction(
  InvoiceActionTypes.uploadInvoices,
  props<{ officeId: string; blob: Blob; fileName: string; driveToken?: string }>(),
);

export const invoiceSaveSuccess = createAction(
  InvoiceActionTypes.invoiceSaveSuccess,
  props<IResponseSuccess>(),
);

export const invoiceUpdateOfficeSuccess = createAction(InvoiceActionTypes.invoiceUpdateOfficeSuccess);

export const clean = createAction(InvoiceActionTypes.clean);
