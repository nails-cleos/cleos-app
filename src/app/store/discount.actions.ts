import { createAction, props } from '@ngrx/store';
import { IError, IResponseSuccess, PageRequest } from '../interfaces/common';
import { IDiscount, IReferral } from '../interfaces/discount';
import { ICurrency } from '../interfaces/currency';
import { DiscountData } from './reducers/discount.reducers';

enum DiscountActionTypes {
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

export const getDiscountsPage = createAction(
  DiscountActionTypes.getDiscountsPage,
  props<PageRequest>(),
);

export const getMyDiscountsPage = createAction(
  DiscountActionTypes.getMyDiscountsPage,
  props<PageRequest>(),
);

export const getMyReferrals = createAction(
  DiscountActionTypes.getMyReferrals,
);

export const getAllCurrency = createAction(
  DiscountActionTypes.getAllCurrency,
);

export const sendDiscountToCustomers = createAction(
  DiscountActionTypes.sendDiscountToCustomers,
  props<{ id: string; customersDiscount: string[] }>(),
);


export const discountSuccess = createAction(
  DiscountActionTypes.discountSuccess,
  props<{ data: DiscountData }>(),
);

export const referralSuccess = createAction(
  DiscountActionTypes.referralSuccess,
  props<{ referrals: IReferral[] }>(),
);

export const currencySuccess = createAction(
  DiscountActionTypes.currencySuccess,
  props<{ currencies: ICurrency[] }>(),
);

export const createDiscount = createAction(
  DiscountActionTypes.createDiscount,
  props<{ discount: IDiscount }>(),
);

export const updateDiscount = createAction(
  DiscountActionTypes.updateDiscount,
  props<{ id: string; discount: IDiscount }>(),
);

export const discountSaveSuccess = createAction(
  DiscountActionTypes.discountSaveSuccess,
  props<IResponseSuccess>(),
);

export const discountFailure = createAction(
  DiscountActionTypes.discountFailure,
  props<{ error: IError }>(),
);

export const discountSelected = createAction(
  DiscountActionTypes.discountSelected,
  props<{ selected?: IDiscount }>(),
);

export const getDiscount = createAction(
  DiscountActionTypes.getDiscount,
  props<{ id: string }>(),
);

export const getUserDiscountByCustomerId = createAction(
  DiscountActionTypes.getUserDiscountByCustomerId,
  props<{ customerId: string }>(),
);

export const deleteDiscount = createAction(
  DiscountActionTypes.deleteDiscount,
  props<{ id: string; name: string }>(),
);


export const cleanDiscount = createAction(
  DiscountActionTypes.clean,
);
