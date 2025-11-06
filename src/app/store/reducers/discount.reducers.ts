import { Pagination } from '../../interfaces/pagination';
import {
  clean,
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
  updateDiscount,
} from '../discount.actions';
import { IDiscount, IReferral, IUserDiscount } from '../../interfaces/discount';
import { ICurrency } from '../../interfaces/currency';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';

export interface State {
  response?: IResponseSuccess;
  data: IDiscount | Pagination<IDiscount> | Pagination<IUserDiscount> | IUserDiscount[] | undefined;
  referrals?: IReferral[];
  currencies?: ICurrency[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IDiscount;
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  referrals: undefined,
  currencies: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const discountReducer = createReducer(
  initialState,
  on(getMyDiscountsPage, getDiscountsPage, (state) => ({
    ...state,
    data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IDiscount>,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getMyReferrals, (state) => ({
    ...state,
    referrals: [],
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllCurrency, (state) => ({
    ...state,
    currencies: [],
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(sendDiscountToCustomers, (state) => ({
    ...state,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(getDiscount, (state) => ({
    ...state,
    data: {} as IDiscount,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getUserDiscountByCustomerId, (state) => ({
    ...state,
    data: [],
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(discountSuccess, (state, { data }) => ({
    ...state,
    data: data,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(referralSuccess, (state, { referrals }) => ({
    ...state,
    referrals: referrals,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(currencySuccess, (state, { currencies }) => ({
    ...state,
    currencies: currencies,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(discountSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(discountSelected, (state, { selected }) => ({
    ...state,
    selected: selected,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(discountFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    error: error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(updateDiscount, createDiscount, deleteDiscount, (state) => ({
    ...state,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(clean, () => initialState),
);
