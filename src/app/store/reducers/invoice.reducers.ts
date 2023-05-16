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
}

export const initialState: State = {
  data: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  offices: null,
  message: null,
  isLoading: false
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case InvoiceActionTypes.invoiceFind: {
      return {
        ...state,
        data: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case InvoiceActionTypes.invoiceSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case InvoiceActionTypes.invoiceFindMyOffices: {
      return {
        ...state,
        offices: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case InvoiceActionTypes.invoiceOfficesSuccess: {
      return {
        ...state,
        offices: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case InvoiceActionTypes.invoiceFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case InvoiceActionTypes.invoiceUpdateOffice: {
      return {
        ...state,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
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
