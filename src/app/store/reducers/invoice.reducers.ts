import {
  clean,
  getAllMyOffices,
  getOfficeToInvoice,
  invoiceFailure,
  invoiceOfficesSuccess,
  invoiceSuccess,
  updateOfficeById,
} from '../invoice.actions';
import { IOffice } from '../../interfaces/office';
import { IInvoice } from '../../interfaces/invoice';
import { IError } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';

export interface State {
  data?: IInvoice[];
  offices?: IOffice[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  isLoading: boolean;
  changes: boolean;
}

export const initialState: State = {
  data: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  offices: undefined,
  isLoading: false,
  changes: true,
};

export const invoiceReducer = createReducer(
  initialState,
  on(getOfficeToInvoice, (state) => ({
    ...state,
    data: [{} as IInvoice, {} as IInvoice, {} as IInvoice],
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    changes: true,
  })),
  on(invoiceSuccess, (state, { data }) => ({
    ...state,
    data: data,
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    changes: true,
  })),
  on(getAllMyOffices, (state) => ({
    ...state,
    offices: undefined,
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    changes: false,
  })),
  on(invoiceOfficesSuccess, (state, { offices }) => ({
    ...state,
    offices: offices,
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    changes: false,
  })),
  on(invoiceFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    error: error,
    subErrors: error.subErrors,
    changes: false,
  })),
  on(updateOfficeById, (state) => ({
    ...state,
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    changes: false,
  })),
  on(clean, () => initialState),
);
