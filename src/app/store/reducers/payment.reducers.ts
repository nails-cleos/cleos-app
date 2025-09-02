import { Pagination } from '../../interfaces/pagination';
import { All, PaymentActionTypes } from '../payment.actions';
import { IPayment } from '../../interfaces/payment';

export interface State {
  data: IPayment | Pagination<IPayment> | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IPayment | IPayment[] | null;
  message: string | null;
  paths: string[] | null;
  reload: boolean | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  paths: null,
  reload: false,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case PaymentActionTypes.paymentByResource: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        selected: [{}, {}, {}],
        message: null,
      };
    }
    case PaymentActionTypes.createPaymentLink:
    case PaymentActionTypes.findPaymentById: {
      return {
        ...state,
        isLoading: true,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
      };
    }
    case PaymentActionTypes.paymentOptions: {
      return {
        ...state,
        data: null,
        isLoading: true,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
      };
    }
    case PaymentActionTypes.paymentSuccess: {
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case PaymentActionTypes.paymentSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        reload: action.payload.reload,
        paths: action.payload.paths,
        errorMessage: null,
        selected: null,
        subErrors: null,
        isLoading: false,
      };
    }
    case PaymentActionTypes.paymentNotComplete: {
      return {
        ...state,
        message: null,
        errorMessage: null,
        subErrors: action.payload.message,
        paths: action.payload.paths,
        isLoading: false,
      };
    }
    case PaymentActionTypes.paymentSelected: {
      return {
        ...state,
        selected: action.payload.payment,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case PaymentActionTypes.paymentFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false,
      };
    }
    case PaymentActionTypes.adjustPayments:
    case PaymentActionTypes.updatePaymentById:
    case PaymentActionTypes.paymentRecreate:
    case PaymentActionTypes.paymentSave:
    case PaymentActionTypes.paymentSend:
    case PaymentActionTypes.paymentNotify: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
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
