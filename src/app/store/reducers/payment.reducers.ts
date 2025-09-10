import { Pagination } from '../../interfaces/pagination';
import { All, PaymentActionTypes } from '../payment.actions';
import { IPayment, IPaymentOption } from '../../interfaces/payment';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: IPayment | Pagination<IPayment> | IPaymentOption[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IPayment | IPayment[];
  paths?: string[];
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case PaymentActionTypes.getPaymentByResourceId: {
      return {
        ...state,
        errorMessage: undefined,
        subErrors: undefined,
        selected: [{}, {}, {}],
        response: undefined,
      };
    }
    case PaymentActionTypes.createPaymentLinkByReservationId:
    case PaymentActionTypes.getPayment: {
      return {
        ...state,
        isLoading: true,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case PaymentActionTypes.getPaymentOptions: {
      return {
        ...state,
        data: undefined,
        isLoading: true,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case PaymentActionTypes.paymentSuccess: {
      return {
        ...state,
        data: action.data,
        isLoading: false,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case PaymentActionTypes.paymentSaveSuccess: {
      return {
        ...state,
        response: action,
        errorMessage: undefined,
        selected: undefined,
        subErrors: undefined,
        isLoading: false,
      };
    }
    case PaymentActionTypes.paymentNotComplete: {
      return {
        ...state,
        response: action.response,
        errorMessage: undefined,
        subErrors: action.subError,
        isLoading: false,
      };
    }
    case PaymentActionTypes.paymentSelected: {
      return {
        ...state,
        selected: action.selected,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case PaymentActionTypes.paymentFailure: {
      return {
        ...state,
        errorMessage: action.error.message,
        error: action.error,
        subErrors: action.error.subErrors,
        response: undefined,
        isLoading: false,
      };
    }
    case PaymentActionTypes.adjustPayments:
    case PaymentActionTypes.updatePaymentById:
    case PaymentActionTypes.recreate:
    case PaymentActionTypes.paymentSave:
    case PaymentActionTypes.paymentSend:
    case PaymentActionTypes.notifyPayment: {
      return {
        ...state,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
        isLoading: true,
      };
    }
    case PaymentActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
