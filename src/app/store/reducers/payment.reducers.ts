import { Pagination } from '../../interfaces/pagination';
import {
  adjustPayments,
  clean,
  createPaymentLinkByReservationId,
  getPayment,
  getPaymentByResourceId,
  paymentOptions,
  notifyPayment,
  paymentFailure,
  paymentNotComplete,
  paymentSave,
  paymentSaveSuccess,
  paymentSelected,
  paymentSend,
  paymentSuccess,
  recreate,
  updatePaymentById,
} from '../payment.actions';
import { IPayment, IPaymentOption } from '../../interfaces/payment';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';

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

export const paymentReducer = createReducer(
  initialState,
  on(getPaymentByResourceId, (state) => ({
    ...state,
    errorMessage: undefined,
    subErrors: undefined,
    selected: [{}, {}, {}] as IPayment[],
    response: undefined,
  })),
  on(createPaymentLinkByReservationId, getPayment, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(paymentOptions, (state) => ({
    ...state,
    data: undefined,
    isLoading: true,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(paymentSuccess, (state, { data }) => ({
    ...state,
    data,
    isLoading: false,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(paymentSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    errorMessage: undefined,
    selected: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(paymentNotComplete, (state, { subError, response }) => ({
    ...state,
    response,
    errorMessage: undefined,
    subErrors: subError,
    isLoading: false,
  })),
  on(paymentSelected, (state, { selected }) => ({
    ...state,
    selected,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(paymentFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(adjustPayments, updatePaymentById, recreate, paymentSave, paymentSend, notifyPayment, (state) => ({
    ...state,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(clean, () => initialState),
);
