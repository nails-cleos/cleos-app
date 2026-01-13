import {
  clean,
  getAllMyOffices,
  getInvoicesPage,
  getOfficeToInvoice,
  invoiceFailure,
  invoiceOfficesSuccess,
  invoicePageSuccess,
  invoiceSaveSuccess,
  invoiceSuccess,
  invoiceView,
  updateOfficeById,
  uploadInvoices,
} from '../invoice.actions';
import { IOfficeAll } from '../../interfaces/office';
import { IInvoice, IInvoiceData } from '../../interfaces/invoice';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';
import { Pagination } from '../../interfaces/pagination';

export const INVOICE_FEATURE_KEY = 'invoice';

export interface InvoiceState {
  response?: IResponseSuccess;
  data?: IInvoice[];
  page?: Pagination<IInvoiceData>;
  offices?: IOfficeAll[];
  error?: IError;
  subErrors?: IError[];
  isLoading: boolean;
}

export const initialState: InvoiceState = {
  response: undefined,
  data: undefined,
  page: undefined,
  error: undefined,
  subErrors: undefined,
  offices: undefined,
  isLoading: false,
};

export const invoiceReducer = createReducer(
  initialState,
  on(getOfficeToInvoice, (state) => ({
    ...state,
    data: [{} as IInvoice, {} as IInvoice, {} as IInvoice],
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(getInvoicesPage, (state) => ({
    ...state,
    page: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IInvoiceData>,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(invoiceSuccess, (state, { data }) => ({
    ...state,
    data,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(invoicePageSuccess, (state, { page }) => ({
    ...state,
    page,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(getAllMyOffices, (state) => ({
    ...state,
    offices: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(invoiceOfficesSuccess, (state, { offices }) => ({
    ...state,
    offices: offices,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(invoiceFailure, (state, { error }) => ({
    ...state,
    error: error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(updateOfficeById, (state) => ({
    ...state,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(invoiceView, (state) => ({
    ...state,
    isLoading: true,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(uploadInvoices, (state) => ({
    ...state,
    isLoading: true,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(invoiceSaveSuccess, (state, action) => ({
    ...state,
    isLoading: false,
    error: undefined,
    subErrors: undefined,
    response: action,
  })),
  on(clean, () => initialState),
);
