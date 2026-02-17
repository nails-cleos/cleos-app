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
  setCurrentAccountId,
  setCurrentCustomerId,
  setCurrentTransactionId,
  updateAccount,
} from '../account.actions';

import { Pagination } from '../../interfaces/pagination';
import { IAccount, IAccountAll, IAccountTransaction, ITransaction } from '../../interfaces/account';
import { IPaymentOption } from '../../interfaces/payment';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { clearGlobalError, clearGlobalResponse } from '../global.actions';

export const ACCOUNT_FEATURE_KEY = 'accounts';

export interface AccountState {
  response?: IResponseSuccess;
  data?: IAccount | IAccountTransaction | ITransaction[];
  paymentOptions?: IPaymentOption[];
  error?: IError;
  subErrors?: IError[];
  selected?: IAccountAll | ITransaction;
  currentAccountId?: string;
  currentTransactionId?: string;
  currentCustomerId?: string;
  isLoading: boolean;
}

export const initialState: AccountState = {
  response: undefined,
  data: undefined,
  paymentOptions: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  currentAccountId: undefined,
  currentTransactionId: undefined,
  currentCustomerId: undefined,
  isLoading: false,
};

export const accountReducer = createReducer(
  initialState,

  on(getTransaction, getAccountByCustomerId, getAccount, (state) => ({
    ...state,
    response: undefined,
    subErrors: undefined,
    selected: {} as IAccountAll,
  })),

  on(paymentOptions, (state) => ({
    ...state,
    response: undefined,
    paymentOptions: undefined,
    subErrors: undefined,
  })),

  on(getTransactionsByAccountId, (state) => ({
    ...state,
    data: {
      transactions: { content: [{}, {}, {}], totalElements: 3 } as Pagination<ITransaction>,
      account: undefined,
    },
    response: undefined,
    subErrors: undefined,
  })),

  on(accountSuccess, (state, { data }) => ({
    ...state,
    data,
    response: undefined,
    subErrors: undefined,
  })),

  on(paymentOptionsSuccess, (state, { paymentOptions }) => ({
    ...state,
    paymentOptions,
    response: undefined,
    subErrors: undefined,
  })),

  on(accountSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    subErrors: undefined,
    isLoading: false,
  })),

  on(accountSelected, (state, { selected }) => ({
    ...state,
    selected,
    response: undefined,
    subErrors: undefined,
  })),

  on(accountFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    error,
    response: undefined,
    isLoading: false,
  })),

  on(paymentSend, updateAccount, createTransaction, (state) => ({
    ...state,
    response: undefined,
    subErrors: undefined,
    isLoading: true,
  })),

  on(setCurrentAccountId, (state, { accountId }) => ({
    ...state,
    currentAccountId: accountId,
  })),

  on(setCurrentTransactionId, (state, { transactionId }) => ({
    ...state,
    currentTransactionId: transactionId,
  })),

  on(setCurrentCustomerId, (state, { customerId }) => ({
    ...state,
    currentCustomerId: customerId,
  })),

  on(clean, (state) => ({
    ...initialState,
    currentAccountId: state.currentAccountId,
    currentTransactionId: state.currentTransactionId,
    currentCustomerId: state.currentCustomerId,
  })),

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
