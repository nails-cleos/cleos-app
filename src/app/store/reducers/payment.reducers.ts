import { Pagination } from '../../interfaces/pagination';
import {
  adjustPayments,
  cleanPayment,
  createPaymentLinkByReservationId,
  getPayment,
  getPaymentByResourceId,
  notifyPayment,
  paymentFailure,
  paymentNotComplete,
  paymentOptions,
  paymentSave,
  paymentSaveSuccess,
  paymentSelected,
  paymentSend,
  paymentSuccess,
  recreate,
  setCurrentPathId,
  setCurrentPaymentId,
  setPaymentResultParams,
  updatePaymentById,
} from '../payment.actions';
import { IPayment, IPaymentOption } from '../../interfaces/payment';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';
import { clearGlobalError, clearGlobalResponse } from '../global.actions';

export const PAYMENT_FEATURE_KEY = 'payment';

export interface PaymentState {
  response?: IResponseSuccess;
  data?: IPayment | Pagination<IPayment> | IPaymentOption[];
  error?: IError;
  subErrors?: IError[];
  selected?: IPayment | IPayment[];
  paths?: string[];
  paymentResultParams?: {
    path: 'reservation' | 'transaction';
    id?: string;
    status?: string;
    paymentId?: string;
    preferenceId?: string;
    payerId?: string;
    token?: string;
    reason?: string;
    orderId?: string;
    orderStatusId?: string;
  };
  currentPaymentId?: string;
  currentPathId?: {
    path: 'reservation' | 'transaction';
    id: string;
  };
  isLoading: boolean;
}

export const initialState: PaymentState = {
  response: undefined,
  data: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  paths: undefined,
  paymentResultParams: undefined,
  currentPaymentId: undefined,
  currentPathId: undefined,
  isLoading: false,
};

export const paymentReducer = createReducer(
  initialState,
  on(getPaymentByResourceId, (state) => ({
    ...state,
    subErrors: undefined,
    selected: [{}, {}, {}] as IPayment[],
    response: undefined,
  })),
  on(createPaymentLinkByReservationId, getPayment, (state) => ({
    ...state,
    isLoading: true,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(paymentOptions, (state) => ({
    ...state,
    data: undefined,
    isLoading: true,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(paymentSuccess, (state, { data }) => ({
    ...state,
    data,
    isLoading: false,
    subErrors: undefined,
    response: undefined,
  })),
  on(paymentSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(paymentNotComplete, (state, { subError, response }) => ({
    ...state,
    response,
    subErrors: subError,
    isLoading: false,
  })),
  on(paymentSelected, (state, { selected }) => ({
    ...state,
    selected,
    subErrors: undefined,
    response: undefined,
  })),
  on(paymentFailure, (state, { error }) => ({
    ...state,
    error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(adjustPayments, updatePaymentById, recreate, paymentSave, paymentSend, notifyPayment, (state) => ({
    ...state,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(setPaymentResultParams,
    (state, { path, id, paymentId, status, orderId, orderStatusId, payerId, preferenceId, reason, token }) => ({
      ...state,
      paymentResultParams: {
        path,
        id,
        paymentId,
        status,
        orderId,
        orderStatusId,
        payerId,
        preferenceId,
        reason,
        token,
      },
    })),
  on(setCurrentPaymentId, (state, { paymentId }) => ({
    ...state,
    currentPaymentId: paymentId,
  })),
  on(setCurrentPathId, (state, { id, path }) => ({
    ...state,
    currentPathId: { id, path },
  })),
  on(cleanPayment, () => initialState),

  on(clearGlobalResponse, (state) => ({
    ...state,
    response: undefined,
  })),

  on(clearGlobalError, (state) => ({
    ...state,
    error: undefined,
    subErrors: undefined,
  })),
);
