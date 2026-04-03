import { createAction, props } from '@ngrx/store';
import { IAccountAll, ITransaction } from '../interfaces/account';
import { IError, IResponseSuccess, PageRequest } from '../interfaces/common';

enum AccountActionTypes {
  accountSuccess = '[Account] Success',
  createTransaction = '[Account] Save',
  updateAccount = '[Account] Update account by id',
  accountSaveSuccess = '[Account] Save Success',
  accountFailure = '[Account] Failure',
  accountSelected = '[Account] Selected',
  getAccount = '[Account] Find account by id',
  paymentSend = '[Account] Payment send',
  getTransactionsByAccountId = '[Account] Get transactions by account id',
  getTransaction = '[Account] find transaction by id',
  getAccountByCustomerId = '[Account] Find account by customer id',
  setCurrentAccountId = '[Account] Set current account id',
  setCurrentTransactionId = '[Account] Set current transaction id',
  setCurrentCustomerId = '[Account] Set current customer id',
  clean = '[Account] Clean'
}

export const accountSuccess = createAction(
  AccountActionTypes.accountSuccess,
  props<{ data: ITransaction[] }>(),
);

export const createTransaction = createAction(
  AccountActionTypes.createTransaction,
  props<{ id: string; transaction: ITransaction }>(),
);

export const updateAccount = createAction(
  AccountActionTypes.updateAccount,
  props<{ id: string; transaction: ITransaction; customerId: string }>(),
);

export const accountSaveSuccess = createAction(
  AccountActionTypes.accountSaveSuccess,
  props<IResponseSuccess>(),
);

export const accountFailure = createAction(
  AccountActionTypes.accountFailure,
  props<{ error: IError }>(),
);

export const accountSelected = createAction(
  AccountActionTypes.accountSelected,
  props<{ selected?: IAccountAll | ITransaction }>(),
);

export const getAccount = createAction(
  AccountActionTypes.getAccount,
  props<{ id: string }>(),
);

export const paymentSend = createAction(
  AccountActionTypes.paymentSend,
  props<{ link: string }>(),
);

export const getTransactionsByAccountId = createAction(
  AccountActionTypes.getTransactionsByAccountId,
  props<PageRequest & { id: string }>(),
);

export const getTransaction = createAction(
  AccountActionTypes.getTransaction,
  props<{ id: string; transactionId: string }>(),
);

export const getAccountByCustomerId = createAction(
  AccountActionTypes.getAccountByCustomerId,
  props<{ customerId: string }>(),
);

export const setCurrentAccountId = createAction(
  AccountActionTypes.setCurrentAccountId,
  props<{ accountId: string }>(),
);

export const setCurrentTransactionId = createAction(
  AccountActionTypes.setCurrentTransactionId,
  props<{ transactionId: string }>(),
);

export const setCurrentCustomerId = createAction(
  AccountActionTypes.setCurrentCustomerId,
  props<{ customerId: string }>(),
);

export const clean = createAction(
  AccountActionTypes.clean,
);
