import { Pagination } from '../../interfaces/pagination';
import { All, PaymentActionTypes } from '../payment.actions';
import { IPayment } from '../../interfaces/payment';
import { IBank } from "../../interfaces/bank";
import { ReservationActionTypes } from "../reservation.actions";

export interface State {
  data: IPayment | Pagination<IPayment> | null;
  banks: IBank[] | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IPayment | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  banks: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case PaymentActionTypes.getAll: {
      return {
        ...state,
        // @ts-ignore
        data: {content: [{}, {}, {}], totalElements: 3},
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case PaymentActionTypes.paymentByReservation: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        // @ts-ignore
        selected: [{}, {}, {}],
        message: null
      };
    }
    case PaymentActionTypes.paymentCreate:
    case PaymentActionTypes.paymentFind: {
      return {
        ...state,
        data: {} as IPayment,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case PaymentActionTypes.paymentBankList: {
      return {
        ...state,
        // @ts-ignore
        banks: [{}, {}, {}],
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case PaymentActionTypes.paymentSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case PaymentActionTypes.paymentSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        errorMessage: null,
        selected: null,
        subErrors: null,
        isLoading: false
      };
    }
    case PaymentActionTypes.paymentBankListSuccess: {
      return {
        ...state,
        banks: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case PaymentActionTypes.paymentNotComplete: {
      return {
        ...state,
        message: null,
        errorMessage: null,
        subErrors: action.payload.message,
        isLoading: false
      };
    }
    case PaymentActionTypes.paymentSelected: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case PaymentActionTypes.paymentFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case PaymentActionTypes.paymentRecreate:
    case PaymentActionTypes.paymentSave:
    case PaymentActionTypes.paymentSend:
    case PaymentActionTypes.paymentNotify: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
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
