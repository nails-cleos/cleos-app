import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IDiscount, IDiscountAll, IReferral, IUserDiscount } from '../../interfaces/discount';
import { IError, ResponseSuccess } from '../../interfaces/common';
import { DISCOUNT_FEATURE_KEY, DiscountState } from '../reducers/discount.reducers';
import { Pagination } from '../../interfaces/pagination';
import { ICurrency } from '../../interfaces/currency';

const selectDiscountState = createFeatureSelector<DiscountState>(DISCOUNT_FEATURE_KEY);

const selectDiscountPaginationData = createSelector(
  selectDiscountState,
  (state: DiscountState) => state?.data,
);
export const getDiscountPaginationPipe = pipe(
  select(selectDiscountPaginationData),
  filter((val): val is Pagination<IDiscount> => val !== undefined),
);

const selectMyDiscountPaginationData = createSelector(
  selectDiscountState,
  (state: DiscountState) => state?.data,
);
export const getMyDiscountPaginationPipe = pipe(
  select(selectMyDiscountPaginationData),
  filter((val): val is Pagination<IUserDiscount> => val !== undefined),
);

const selectReferrals = createSelector(
  selectDiscountState,
  (state: DiscountState) => state?.referrals,
);
export const getReferralsPipe = pipe(
  select(selectReferrals),
  filter((val): val is IReferral[] => val !== undefined),
);

const selectCurrentDiscountId = createSelector(
  selectDiscountState,
  (state: DiscountState) => state?.currentDiscountId,
);
export const getCurrentDiscountIdPipe = pipe(
  select(selectCurrentDiscountId),
  filter((val): val is string => val !== undefined),
);

const selectedDiscount = createSelector(
  selectDiscountState,
  (state: DiscountState) => state?.selected,
);
export const getSelectedDiscountPipe = pipe(
  select(selectedDiscount),
  filter((val): val is IDiscountAll => val !== undefined),
);

const selectedCurrencies = createSelector(
  selectDiscountState,
  (state: DiscountState) => state?.currencies,
);
export const getCurrenciesPipe = pipe(
  select(selectedCurrencies),
  filter((val): val is ICurrency[] => val !== undefined),
);

const selectedUserDiscount = createSelector(
  selectDiscountState,
  (state: DiscountState) => state?.data,
);
export const getUserDiscountsPipe = pipe(
  select(selectedUserDiscount),
  filter((val): val is IUserDiscount[] => val !== undefined),
);

const selectSubErrors = createSelector(
  selectDiscountState,
  (state: DiscountState) => state?.subErrors,
);
export const getSubErrorsPipe = pipe(
  select(selectSubErrors),
  filter((val): val is IError[] => val !== undefined),
);

const selectDiscountResponse = createSelector(
  selectDiscountState,
  (state: DiscountState) => state?.response,
);
export const getDiscountResponsePipe = pipe(
  select(selectDiscountResponse),
  filter((val): val is ResponseSuccess => val !== undefined),
);

const selectDiscountError = createSelector(
  selectDiscountState,
  (state: DiscountState) => state?.error,
);
export const getDiscountErrorPipe = pipe(
  select(selectDiscountError),
  filter((val): val is IError => val !== undefined),
);

const selectDiscountIsLoading = createSelector(
  selectDiscountState,
  (state: DiscountState) => state?.isLoading,
);
export const getDiscountIsLoadingPipe = pipe(
  select(selectDiscountIsLoading),
  filter((val): val is boolean => val !== undefined),
);
