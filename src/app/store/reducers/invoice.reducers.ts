import { All, InvoiceActionTypes } from '../invoice.actions';
import { IOffice } from '../../interfaces/office';
import { IInvoice } from '../../interfaces/invoice';
import { IError } from '../../interfaces/common';

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

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case InvoiceActionTypes.getOfficeToInvoice: {
      return {
        ...state,
        data: [{} as IInvoice, {} as IInvoice, {} as IInvoice],
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        changes: true,
      };
    }
    case InvoiceActionTypes.invoiceSuccess: {
      return {
        ...state,
        data: action.data,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        changes: true,
      };
    }
    case InvoiceActionTypes.getAllMyOffices: {
      return {
        ...state,
        offices: undefined,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        changes: false,
      };
    }
    case InvoiceActionTypes.invoiceOfficesSuccess: {
      return {
        ...state,
        offices: action.offices,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        changes: false,
      };
    }
    case InvoiceActionTypes.invoiceFailure: {
      return {
        ...state,
        errorMessage: action.error.message,
        error: action.error,
        subErrors: action.error.subErrors,
        changes: false,
      };
    }
    case InvoiceActionTypes.updateOfficeById: {
      return {
        ...state,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        changes: false,
      };
    }
    case InvoiceActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
