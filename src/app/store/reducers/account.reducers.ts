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
  paymentSend,
  updateAccount,
} from '../account.actions';

import { Pagination } from '../../interfaces/pagination';
import { IAccount, IAccountAll, IAccountTransaction, ITransaction } from '../../interfaces/account';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { clearGlobalError, clearGlobalResponse } from '../global.actions';

export const ACCOUNT_FEATURE_KEY = 'accounts';

export interface AccountState {
  response?: IResponseSuccess;
  data?: IAccount | IAccountTransaction | ITransaction[];
  error?: IError;
  subErrors?: IError[];
  selected?: IAccountAll | ITransaction;
  isLoading: boolean;
}

export const initialState: AccountState = {
  response: undefined,
  data: undefined,
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
    subErrors: undefined,
    selected: {} as IAccountAll,
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
  on(clean, () => initialState),

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
