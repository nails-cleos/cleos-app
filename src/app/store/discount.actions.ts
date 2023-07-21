import { Action } from '@ngrx/store';

export enum DiscountActionTypes {
  getAll = '[Discount] Get all',
  getMyDiscounts = '[Discount] get my discounts',
  getReferrals = '[Discount] get my referrals',
  getCurrencies = '[Discount] get currencies',
  addDiscount = '[Discount] Add discount',
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

export class GetAll implements Action {
  readonly type = DiscountActionTypes.getAll;

  constructor(public payload: any) {
  }
}

export class GetMyDiscounts implements Action {
  readonly type = DiscountActionTypes.getMyDiscounts;

  constructor(public payload: any) {
  }
}

export class GetReferrals implements Action {
  readonly type = DiscountActionTypes.getReferrals;
}

export class GetCurrencies implements Action {
  readonly type = DiscountActionTypes.getCurrencies;
}

export class AddDiscount implements Action {
  readonly type = DiscountActionTypes.addDiscount;

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
  | GetAll
  | GetMyDiscounts
  | GetReferrals
  | GetCurrencies
  | AddDiscount
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
