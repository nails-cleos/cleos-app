import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { ICurrency, ICurrencyAll } from '../../interfaces/currency';
import { IError, ResponseSuccess } from '../../interfaces/common';
import { CURRENCY_FEATURE_KEY, CurrencyState } from '../reducers/currency.reducers';
import { Pagination } from '../../interfaces/pagination';

const selectCurrencyState = createFeatureSelector<CurrencyState>(CURRENCY_FEATURE_KEY);

const selectCurrencyPaginationData = createSelector(
  selectCurrencyState,
  (state: CurrencyState) => state?.data,
);
export const getCurrencyPaginationPipe = pipe(
  select(selectCurrencyPaginationData),
  filter((val): val is Pagination<ICurrency> => val !== undefined),
);

const selectCurrentCurrencyId = createSelector(
  selectCurrencyState,
  (state: CurrencyState) => state?.currentCurrencyId,
);
export const getCurrentCurrencyIdPipe = pipe(
  select(selectCurrentCurrencyId),
  filter((val): val is string => val !== undefined),
);

const selectedCurrency = createSelector(
  selectCurrencyState,
  (state: CurrencyState) => state?.selected,
);
export const getSelectedCurrencyPipe = pipe(
  select(selectedCurrency),
  filter((val): val is ICurrencyAll => val !== undefined),
);

const selectSubErrors = createSelector(
  selectCurrencyState,
  (state: CurrencyState) => state?.subErrors,
);
export const getSubErrorsPipe = pipe(
  select(selectSubErrors),
  filter((val): val is IError[] => val !== undefined),
);

const selectCurrencyResponse = createSelector(
  selectCurrencyState,
  (state: CurrencyState) => state?.response,
);
export const getCurrencyResponsePipe = pipe(
  select(selectCurrencyResponse),
  filter((val): val is ResponseSuccess => val !== undefined),
);

const selectCurrencyError = createSelector(
  selectCurrencyState,
  (state: CurrencyState) => state?.error,
);
export const getCurrencyErrorPipe = pipe(
  select(selectCurrencyError),
  filter((val): val is IError => val !== undefined),
);

const selectCurrencyIsLoading = createSelector(
  selectCurrencyState,
  (state: CurrencyState) => state?.isLoading,
);
export const getCurrencyIsLoadingPipe = pipe(
  select(selectCurrencyIsLoading),
  filter((val): val is boolean => val !== undefined),
);
