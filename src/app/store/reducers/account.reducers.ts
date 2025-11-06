import { createReducer, on } from '@ngrx/store';
import {
  accountFailure,
  accountSaveSuccess,
  accountSelected,
  accountSuccess,
  clean,
  createTransaction,
  getAccount,
  getAccountByCustomerId,
  getTransaction,
  getTransactionsByAccountId,
  paymentOptions,
  paymentOptionsSuccess,
  paymentSend,
  updateAccount,
} from '../account.actions';

import { Pagination } from '../../interfaces/pagination';
import { IAccount, IAccountTransaction, ITransaction } from '../../interfaces/account';
import { IPaymentOption } from '../../interfaces/payment';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: IAccount | IAccountTransaction | ITransaction[];
  paymentOptions?: IPaymentOption[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IAccount;
  isLoading: boolean;
}

export const initialState: State = {
  response: undefined,
  data: undefined,
  paymentOptions: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  isLoading: false,
};

export const accountReducer = createReducer(
  initialState,

  on(getTransaction, getAccountByCustomerId, getAccount, (state) => ({
    ...state,
    response: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    selected: {} as IAccount,
  })),

  on(paymentOptions, (state) => ({
    ...state,
    response: undefined,
    paymentOptions: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),

  on(getTransactionsByAccountId, (state) => ({
    ...state,
    data: {
      transactions: { content: [{}, {}, {}], totalElements: 3 } as Pagination<ITransaction>,
      account: undefined,
    },
    response: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),

  on(accountSuccess, (state, { data }) => ({
    ...state,
    data,
    response: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),

  on(paymentOptionsSuccess, (state, { paymentOptions }) => ({
    ...state,
    paymentOptions,
    response: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),

  on(accountSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    isLoading: false,
  })),

  on(accountSelected, (state, { selected }) => ({
    ...state,
    selected,
    response: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),

  on(accountFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),

  on(paymentSend, updateAccount, createTransaction, (state) => ({
    ...state,
    response: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    isLoading: true,
  })),

  on(clean, () => initialState),
);
