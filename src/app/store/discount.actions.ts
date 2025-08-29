import { Action } from '@ngrx/store';

export enum DiscountActionTypes {
  getDiscountsPage = '[Discount] Get discounts page',
  getMyDiscountsPage = '[Discount] Get my discounts page',
  getMyReferrals = '[Discount] Get my referrals',
  getAllCurrency = '[Discount] Get all currency',
  sendDiscountToCustomers = '[Discount] Send discount to customers',
  discountSuccess = '[Discount] Success',
  referralSuccess = '[Discount] referral Success',
  currencySuccess = '[Discount] currency Success',
  discountSave = '[Discount] Save',
  discountUpdate = '[Discount] Update',
  discountSaveSuccess = '[Discount] Save Success',
  discountFailure = '[Discount] Failure',
  discountSelected = '[Discount] Selected',
  discountFind = '[Discount] Find',
  discountFindByCustomer = '[Discount] Find by customer',
  discountDelete = '[Discount] Delete',
  clean = '[Discount] Clean'
}

export class GetDiscountsPage implements Action {
  readonly type = DiscountActionTypes.getDiscountsPage;

  constructor(public payload: any) {
  }
}

export class GetMyDiscountsPage implements Action {
  readonly type = DiscountActionTypes.getMyDiscountsPage;

  constructor(public payload: any) {
  }
}

export class GetMyReferrals implements Action {
  readonly type = DiscountActionTypes.getMyReferrals;
}

export class GetAllCurrency implements Action {
  readonly type = DiscountActionTypes.getAllCurrency;
}

export class SendDiscountToCustomers implements Action {
  readonly type = DiscountActionTypes.sendDiscountToCustomers;

  constructor(public payload: any) {
  }
}

export class DiscountSuccess implements Action {
  readonly type = DiscountActionTypes.discountSuccess;

  constructor(public payload: any) {
  }
}

export class ReferralSuccess implements Action {
  readonly type = DiscountActionTypes.referralSuccess;

  constructor(public payload: any) {
  }
}

export class CurrencySuccess implements Action {
  readonly type = DiscountActionTypes.currencySuccess;

  constructor(public payload: any) {
  }
}

export class DiscountSave implements Action {
  readonly type = DiscountActionTypes.discountSave;

  constructor(public payload: any) {
  }
}

export class DiscountUpdate implements Action {
  readonly type = DiscountActionTypes.discountUpdate;

  constructor(public payload: any) {
  }
}

export class DiscountSaveSuccess implements Action {
  readonly type = DiscountActionTypes.discountSaveSuccess;

  constructor(public payload: any) {
  }
}

export class DiscountFailure implements Action {
  readonly type = DiscountActionTypes.discountFailure;

  constructor(public payload: any) {
  }
}

export class DiscountSelected implements Action {
  readonly type = DiscountActionTypes.discountSelected;

  constructor(public payload: any) {
  }
}

export class DiscountFind implements Action {
  readonly type = DiscountActionTypes.discountFind;

  constructor(public payload: any) {
  }
}

export class DiscountFindByCustomer implements Action {
  readonly type = DiscountActionTypes.discountFindByCustomer;

  constructor(public payload: any) {
  }
}

export class DeleteDiscount implements Action {
  readonly type = DiscountActionTypes.discountDelete;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = DiscountActionTypes.clean;
}

export type All =
  | GetDiscountsPage
  | GetMyDiscountsPage
  | GetMyReferrals
  | GetAllCurrency
  | SendDiscountToCustomers
  | DiscountSave
  | DiscountUpdate
  | DiscountSuccess
  | ReferralSuccess
  | CurrencySuccess
  | DiscountSaveSuccess
  | DiscountFailure
  | DiscountFind
  | DiscountFindByCustomer
  | DiscountSelected
  | DeleteDiscount
  | Clean;
