import {
  clean,
  getAllMyOffices,
  getOfficeToInvoice,
  invoiceFailure,
  invoiceOfficesSuccess,
  invoiceSuccess,
  updateOfficeById,
} from '../invoice.actions';
import { IOfficeAll } from '../../interfaces/office';
import { IInvoice } from '../../interfaces/invoice';
import { IError } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';

export const INVOICE_FEATURE_KEY = 'invoice';

export interface InvoiceState {
  data?: IInvoice[];
  offices?: IOfficeAll[];
  error?: IError;
  subErrors?: IError[];
  isLoading: boolean;
}

export const initialState: InvoiceState = {
  data: undefined,
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
  })),
  on(invoiceSuccess, (state, { data }) => ({
    ...state,
    data: data,
    error: undefined,
    subErrors: undefined,
  })),
  on(getAllMyOffices, (state) => ({
    ...state,
    offices: undefined,
    error: undefined,
    subErrors: undefined,
  })),
  on(invoiceOfficesSuccess, (state, { offices }) => ({
    ...state,
    offices: offices,
    error: undefined,
    subErrors: undefined,
  })),
  on(invoiceFailure, (state, { error }) => ({
    ...state,
    error: error,
    subErrors: error.subErrors,
  })),
  on(updateOfficeById, (state) => ({
    ...state,
    error: undefined,
    subErrors: undefined,
  })),
  on(clean, () => initialState),
);
