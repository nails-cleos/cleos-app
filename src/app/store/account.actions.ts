import { Action } from '@ngrx/store';
import { IAccount, ITransaction } from '../interfaces/account';
import { IError, PageRequest, ResponseSuccess } from '../interfaces/common';
import { IPaymentOption } from '../interfaces/payment';
import { SortDirection } from '@angular/material/sort';

export enum AccountActionTypes {
  accountSuccess = '[Account] Success',
  createTransaction = '[Account] Save',
  updateAccount = '[Account] Update account by id',
  accountSaveSuccess = '[Account] Save Success',
  accountFailure = '[Account] Failure',
  accountSelected = '[Account] Selected',
  getAccount = '[Account] Find account by id',
  paymentOptions = '[Account] Payment Option',
  paymentOptionsSuccess = '[Account] Payment Option success',
  paymentSend = '[Account] Payment send',
  getTransactionsByAccountId = '[Account] Get transactions by account id',
  getTransaction = '[Account] find transaction by id',
  getAccountByCustomerId = '[Account] Find account by customer id',
  clean = '[Account] Clean'
}

export class AccountSuccess implements Action {
  readonly type = AccountActionTypes.accountSuccess;

  constructor(public data: ITransaction[]) {
  }
}

export class PaymentOptionsSuccess implements Action {
  readonly type = AccountActionTypes.paymentOptionsSuccess;

  constructor(public paymentOptions?: IPaymentOption[]) {
  }
}

export class CreateTransaction implements Action {
  readonly type = AccountActionTypes.createTransaction;

  constructor(public id: string, public transaction: ITransaction) {
  }
}

export class UpdateAccount implements Action {
  readonly type = AccountActionTypes.updateAccount;

  constructor(public id: string, public transaction: ITransaction, public customerId: string) {
  }
}

export class AccountSaveSuccess extends ResponseSuccess implements Action {
  readonly type = AccountActionTypes.accountSaveSuccess;
}

export class AccountFailure implements Action {
  readonly type = AccountActionTypes.accountFailure;

  constructor(public error: IError) {
  }
}

export class AccountSelected implements Action {
  readonly type = AccountActionTypes.accountSelected;

  constructor(public selected?: IAccount | ITransaction) {
  }
}

export class GetAccount implements Action {
  readonly type = AccountActionTypes.getAccount;

  constructor(public id: string) {
  }
}

export class PaymentOptions implements Action {
  readonly type = AccountActionTypes.paymentOptions;
}

export class PaymentSend implements Action {
  readonly type = AccountActionTypes.paymentSend;

  constructor(public link: string) {
  }
}

export class GetTransactionsByAccountId extends PageRequest implements Action {
  readonly type = AccountActionTypes.getTransactionsByAccountId;

  constructor(public id: string, public page: number, public sort: string, public direction: SortDirection,
              public size: number) {
    super(page, sort, direction, size);
  }
}

export class GetTransaction implements Action {
  readonly type = AccountActionTypes.getTransaction;

  constructor(public id: string, public transactionId: string) {
  }
}

export class GetAccountByCustomerId implements Action {
  readonly type = AccountActionTypes.getAccountByCustomerId;

  constructor(public customerId: string) {
  }
}

export class Clean implements Action {
  readonly type = AccountActionTypes.clean;
}

export type All =
  | CreateTransaction
  | UpdateAccount
  | AccountSuccess
  | AccountSaveSuccess
  | AccountFailure
  | GetAccount
  | GetTransactionsByAccountId
  | GetAccountByCustomerId
  | AccountSelected
  | PaymentOptions
  | PaymentOptionsSuccess
  | PaymentSend
  | GetTransaction
  | Clean;
