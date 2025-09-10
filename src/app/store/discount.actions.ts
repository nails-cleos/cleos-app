import { Action } from '@ngrx/store';
import { IError, PageRequest, ResponseSuccess } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';
import { IDiscount, IReferral, IUserDiscount } from '../interfaces/discount';
import { ICurrency } from '../interfaces/currency';

export enum DiscountActionTypes {
  getDiscountsPage = '[Discount] Get discounts page',
  getMyDiscountsPage = '[Discount] Get my discounts page',
  getMyReferrals = '[Discount] Get my referrals',
  getAllCurrency = '[Discount] Get all currency',
  sendDiscountToCustomers = '[Discount] Send discount to customers',
  discountSuccess = '[Discount] Success',
  referralSuccess = '[Discount] referral Success',
  currencySuccess = '[Discount] currency Success',
  createDiscount = '[Discount] Create discount',
  updateDiscount = '[Discount] Update discount by id',
  discountSaveSuccess = '[Discount] Save Success',
  discountFailure = '[Discount] Failure',
  discountSelected = '[Discount] Selected',
  getDiscount = '[Discount] Find discount by id',
  getUserDiscountByCustomerId = '[Discount] Find user discount by customer id',
  deleteDiscount = '[Discount] Delete discount by id',
  clean = '[Discount] Clean'
}

export class GetDiscountsPage extends PageRequest implements Action {
  readonly type = DiscountActionTypes.getDiscountsPage;
}

export class GetMyDiscountsPage extends PageRequest implements Action {
  readonly type = DiscountActionTypes.getMyDiscountsPage;
}

export class GetMyReferrals implements Action {
  readonly type = DiscountActionTypes.getMyReferrals;
}

export class GetAllCurrency implements Action {
  readonly type = DiscountActionTypes.getAllCurrency;
}

export class SendDiscountToCustomers implements Action {
  readonly type = DiscountActionTypes.sendDiscountToCustomers;

  constructor(public id: string, public customersDiscount: string[]) {
  }
}

export class DiscountSuccess implements Action {
  readonly type = DiscountActionTypes.discountSuccess;

  constructor(public data: Pagination<IDiscount> | Pagination<IUserDiscount> | IUserDiscount[]) {
  }
}

export class ReferralSuccess implements Action {
  readonly type = DiscountActionTypes.referralSuccess;

  constructor(public referrals: IReferral[]) {
  }
}

export class CurrencySuccess implements Action {
  readonly type = DiscountActionTypes.currencySuccess;

  constructor(public currencies: ICurrency[]) {
  }
}

export class CreateDiscount implements Action {
  readonly type = DiscountActionTypes.createDiscount;

  constructor(public discount: IDiscount) {
  }
}

export class UpdateDiscount implements Action {
  readonly type = DiscountActionTypes.updateDiscount;

  constructor(public id: string, public discount: IDiscount) {
  }
}

export class DiscountSaveSuccess extends ResponseSuccess implements Action {
  readonly type = DiscountActionTypes.discountSaveSuccess;
}

export class DiscountFailure implements Action {
  readonly type = DiscountActionTypes.discountFailure;

  constructor(public error: IError) {
  }
}

export class DiscountSelected implements Action {
  readonly type = DiscountActionTypes.discountSelected;

  constructor(public selected?: IDiscount) {
  }
}

export class GetDiscount implements Action {
  readonly type = DiscountActionTypes.getDiscount;

  constructor(public id: string) {
  }
}

export class GetUserDiscountByCustomerId implements Action {
  readonly type = DiscountActionTypes.getUserDiscountByCustomerId;

  constructor(public customerId: string) {
  }
}

export class DeleteDiscount implements Action {
  readonly type = DiscountActionTypes.deleteDiscount;

  constructor(public id: string, public name: string) {
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
  | CreateDiscount
  | UpdateDiscount
  | DiscountSuccess
  | ReferralSuccess
  | CurrencySuccess
  | DiscountSaveSuccess
  | DiscountFailure
  | GetDiscount
  | GetUserDiscountByCustomerId
  | DiscountSelected
  | DeleteDiscount
  | Clean;
