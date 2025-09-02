import { Action } from '@ngrx/store';

export enum AccountActionTypes {
  accountSuccess = '[Account] Success',
  addMoney = '[Account] Save',
  updateAccountById = '[Account] Update account by id',
  accountSaveSuccess = '[Account] Save Success',
  accountFailure = '[Account] Failure',
  accountSelected = '[Account] Selected',
  findAccountById = '[Account] Find account by id',
  paymentOptions = '[Account] Payment Option',
  paymentOptionsSuccess = '[Account] Payment Option success',
  paymentSend = '[Account] Payment send',
  getTransactionsByAccountId = '[Account] Get transactions by account id',
  findTransactionById = '[Account] find transaction by id',
  findAccountByCustomerId = '[Account] Find account by customer id',
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

export class AddMoney implements Action {
  readonly type = AccountActionTypes.addMoney;

  constructor(public payload: any) {
  }
}

export class UpdateAccountById implements Action {
  readonly type = AccountActionTypes.updateAccountById;

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

export class FindAccountById implements Action {
  readonly type = AccountActionTypes.findAccountById;

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

export class GetTransactionsByAccountId implements Action {
  readonly type = AccountActionTypes.getTransactionsByAccountId;

  constructor(public payload: any) {
  }
}

export class FindTransactionById implements Action {
  readonly type = AccountActionTypes.findTransactionById;

  constructor(public payload: any) {
  }
}

export class FindAccountByCustomerId implements Action {
  readonly type = AccountActionTypes.findAccountByCustomerId;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = AccountActionTypes.clean;
}

export type All =
  | AddMoney
  | UpdateAccountById
  | AccountSuccess
  | AccountSaveSuccess
  | AccountFailure
  | FindAccountById
  | GetTransactionsByAccountId
  | FindAccountByCustomerId
  | AccountSelected
  | PaymentOptions
  | PaymentOptionsSuccess
  | PaymentSend
  | FindTransactionById
  | Clean;
