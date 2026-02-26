import { Pagination } from '../../interfaces/pagination';
import {
  cleanDiscount,
  createDiscount,
  currencySuccess,
  deleteDiscount,
  discountFailure,
  discountSaveSuccess,
  discountSelected,
  discountSuccess,
  getAllCurrency,
  getDiscount,
  getDiscountsPage,
  getMyDiscountsPage,
  getMyReferrals,
  getUserDiscountByCustomerId,
  referralSuccess,
  sendDiscountToCustomers,
  setCurrentDiscountId,
  updateDiscount,
} from '../discount.actions';
import { IDiscount, IDiscountAll, IReferral, IUserDiscount } from '../../interfaces/discount';
import { ICurrency } from '../../interfaces/currency';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';
import { clearGlobalError, clearGlobalResponse } from '../global.actions';

export const DISCOUNT_FEATURE_KEY = 'discount';

export type DiscountData =
  | { kind: 'paginationDiscount'; value: Pagination<IDiscountAll> }
  | { kind: 'pagination'; value: Pagination<IUserDiscount> }
  | { kind: 'list'; value: IUserDiscount[] };

export interface DiscountState {
  response?: IResponseSuccess;
  data?: DiscountData;
  referrals?: IReferral[];
  currencies?: ICurrency[];
  error?: IError;
  subErrors?: IError[];
  selected?: IDiscount;
  isLoading: boolean;
  currentDiscountId?: string;
}

export const initialState: DiscountState = {
  data: undefined,
  referrals: undefined,
  currencies: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
  currentDiscountId: undefined,
};

export const discountReducer = createReducer(
  initialState,
  on(getMyDiscountsPage, getDiscountsPage, (state) => ({
    ...state,
    data: {
      kind: 'paginationDiscount',
      value: {
        content: [{}, {}, {}],
        totalElements: 3,
      } as Pagination<IDiscountAll>,
    },
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getMyReferrals, (state) => ({
    ...state,
    referrals: [],
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllCurrency, (state) => ({
    ...state,
    currencies: [],
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(sendDiscountToCustomers, (state) => ({
    ...state,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(getDiscount, (state) => ({
    ...state,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getUserDiscountByCustomerId, (state) => ({
    ...state,
    data: {
      kind: 'list',
      value: [],
    },
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(discountSuccess, (state, { data }) => ({
    ...state,
    data,
    subErrors: undefined,
    response: undefined,
  })),
  on(referralSuccess, (state, { referrals }) => ({
    ...state,
    referrals: referrals,
    subErrors: undefined,
    response: undefined,
  })),
  on(currencySuccess, (state, { currencies }) => ({
    ...state,
    currencies: currencies,
    subErrors: undefined,
    response: undefined,
  })),
  on(discountSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(discountSelected, (state, { selected }) => ({
    ...state,
    selected: selected,
    subErrors: undefined,
    response: undefined,
  })),
  on(discountFailure, (state, { error }) => ({
    ...state,
    error: error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(updateDiscount, createDiscount, deleteDiscount, (state) => ({
    ...state,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
    selected: undefined,
  })),
  on(setCurrentDiscountId, (state, { discountId }) => ({
    ...state,
    currentDiscountId: discountId,
  })),
  on(cleanDiscount, () => initialState),

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
