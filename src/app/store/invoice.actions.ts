import { createAction, props } from '@ngrx/store';
import { IError, IResponseSuccess, PageRequest } from '../interfaces/common';
import { IInvoice, IInvoiceData } from '../interfaces/invoice';
import { IOffice } from '../interfaces/office';
import { Pagination } from '../interfaces/pagination';

enum InvoiceActionTypes {
  getInvoicesPage = '[Invoice] Get invoices page',
  getOfficeToInvoice = '[Invoice] Find office to invoice',
  invoiceSuccess = '[Invoice] Success',
  invoicePageSuccess = '[Invoice] Success page',
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

export const getInvoicesPage = createAction(
  InvoiceActionTypes.getInvoicesPage,
  props<{ officeId: string } & PageRequest>(),
);

export const invoicePageSuccess = createAction(
  InvoiceActionTypes.invoicePageSuccess,
  props<{ page: Pagination<IInvoiceData> }>(),
);

export const invoiceSuccess = createAction(
  InvoiceActionTypes.invoiceSuccess,
  props<{ data: IInvoice[] }>(),
);

export const invoiceFailure = createAction(
  InvoiceActionTypes.invoiceFailure,
  props<{ error: IError }>(),
);

export const updateOfficeById = createAction(
  InvoiceActionTypes.updateOfficeById,
  props<{ id: string, office: IOffice }>(),
);

export const uploadInvoices = createAction(
  InvoiceActionTypes.uploadInvoices,
  props<{ officeId: string; blob: Blob; fileName: string; upload: boolean }>(),
);

export const invoiceSaveSuccess = createAction(
  InvoiceActionTypes.invoiceSaveSuccess,
  props<IResponseSuccess>(),
);

export const invoiceUpdateOfficeSuccess = createAction(InvoiceActionTypes.invoiceUpdateOfficeSuccess);

export const cleanInvoice = createAction(InvoiceActionTypes.clean);
