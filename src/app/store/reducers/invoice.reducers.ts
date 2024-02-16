import { All, InvoiceActionTypes } from '../invoice.actions';
import { IOfficeAll } from '../../interfaces/office';
import { IInvoice } from '../../interfaces/invoice';

export interface State {
  data: IInvoice[] | null;
  offices: IOfficeAll[] | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  message: string | null;
  isLoading: boolean;
  changes: boolean;
}

export const initialState: State = {
  data: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  offices: null,
  message: null,
  isLoading: false,
  changes: true
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case InvoiceActionTypes.invoiceFind: {
      return {
        ...state,
        data: [{} as IInvoice, {} as IInvoice, {} as IInvoice],
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null,
        changes: true
      };
    }
    case InvoiceActionTypes.invoiceSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null,
        changes: true
      };
    }
    case InvoiceActionTypes.invoiceFindMyOffices: {
      return {
        ...state,
        offices: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null,
        changes: false
      };
    }
    case InvoiceActionTypes.invoiceOfficesSuccess: {
      return {
        ...state,
        offices: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null,
        changes: false
      };
    }
    case InvoiceActionTypes.invoiceFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        changes: false
      };
    }
    case InvoiceActionTypes.invoiceUpdateOffice: {
      return {
        ...state,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null,
        changes: false
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
