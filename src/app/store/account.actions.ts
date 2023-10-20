import { Action } from '@ngrx/store';

export enum AccountActionTypes {
  accountSuccess = '[Account] Success',
  accountSave = '[Account] Save',
  accountUpdate = '[Account] Update',
  accountSaveSuccess = '[Account] Save Success',
  accountFailure = '[Account] Failure',
  accountSelected = '[Account] Selected',
  accountFind = '[Account] Find',
  paymentOptions = '[Account] Payment Option',
  paymentOptionsSuccess = '[Account] Payment Option success',
  paymentSend = '[Account] Payment send',
  accountFindTransactions = '[Account] Find transactions',
  accountTransactionDetail = '[Account] transaction detail',
  accountFindByCustomer = '[Account] Find by customer',
  clean = '[Account] Clean'
}

export class AccountSuccess implements Action {
  readonly type = AccountActionTypes.accountSuccess;

  constructor(public payload: any) {
  }
}

export class PaymentOptionsSuccess implements Action {
  readonly type = AccountActionTypes.paymentOptionsSuccess;

  constructor(public payload: any) {
  }
}

export class AccountSave implements Action {
  readonly type = AccountActionTypes.accountSave;

  constructor(public payload: any) {
  }
}

export class AccountUpdate implements Action {
  readonly type = AccountActionTypes.accountUpdate;

  constructor(public payload: any) {
  }
}

export class AccountSaveSuccess implements Action {
  readonly type = AccountActionTypes.accountSaveSuccess;

  constructor(public payload: any) {
  }
}

export class AccountFailure implements Action {
  readonly type = AccountActionTypes.accountFailure;

  constructor(public payload: any) {
  }
}

export class AccountSelected implements Action {
  readonly type = AccountActionTypes.accountSelected;

  constructor(public payload: any) {
  }
}

export class AccountFind implements Action {
  readonly type = AccountActionTypes.accountFind;

  constructor(public payload: any) {
  }
}

export class PaymentOptions implements Action {
  readonly type = AccountActionTypes.paymentOptions;
}

export class PaymentSend implements Action {
  readonly type = AccountActionTypes.paymentSend;

  constructor(public payload: any) {
  }
}

export class AccountFindTransactions implements Action {
  readonly type = AccountActionTypes.accountFindTransactions;

  constructor(public payload: any) {
  }
}

export class TransactionDetail implements Action {
  readonly type = AccountActionTypes.accountTransactionDetail;

  constructor(public payload: any) {
  }
}

export class AccountFindByCustomer implements Action {
  readonly type = AccountActionTypes.accountFindByCustomer;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = AccountActionTypes.clean;
}

export type All =
  | AccountSave
  | AccountUpdate
  | AccountSuccess
  | AccountSaveSuccess
  | AccountFailure
  | AccountFind
  | AccountFindTransactions
  | AccountFindByCustomer
  | AccountSelected
  | PaymentOptions
  | PaymentOptionsSuccess
  | PaymentSend
  | TransactionDetail
  | Clean;
