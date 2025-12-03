import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IExpenseAll, IExpenseInfo } from '../../interfaces/expense';
import { IError, ResponseSuccess } from '../../interfaces/common';
import { EXPENSE_FEATURE_KEY, ExpenseState } from '../reducers/expense.reducers';
import { Pagination } from '../../interfaces/pagination';

const selectExpenseState = createFeatureSelector<ExpenseState>(EXPENSE_FEATURE_KEY);

const selectExpensePaginationData = createSelector(
  selectExpenseState,
  (state: ExpenseState) => state?.data,
);
export const getExpensePaginationPipe = pipe(
  select(selectExpensePaginationData),
  filter((val): val is Pagination<IExpenseAll> => val !== undefined),
);

const selectCurrentExpenseId = createSelector(
  selectExpenseState,
  (state: ExpenseState) => state?.currentExpenseId,
);
export const getCurrentExpenseIdPipe = pipe(
  select(selectCurrentExpenseId),
  filter((val): val is string => val !== undefined),
);

const selectedExpense = createSelector(
  selectExpenseState,
  (state: ExpenseState) => state?.selected,
);
export const getSelectedExpensePipe = pipe(
  select(selectedExpense),
  filter((val): val is IExpenseAll => val !== undefined),
);

const selectInfo = createSelector(
  selectExpenseState,
  (state: ExpenseState) => state?.info,
);
export const getInfoPipe = pipe(
  select(selectInfo),
  filter((val): val is IExpenseInfo => val !== undefined),
);

const selectSubErrors = createSelector(
  selectExpenseState,
  (state: ExpenseState) => state?.subErrors,
);
export const getSubErrorsPipe = pipe(
  select(selectSubErrors),
  filter((val): val is IError[] => val !== undefined),
);

const selectExpenseResponse = createSelector(
  selectExpenseState,
  (state: ExpenseState) => state?.response,
);
export const getExpenseResponsePipe = pipe(
  select(selectExpenseResponse),
  filter((val): val is ResponseSuccess => val !== undefined),
);

const selectExpenseError = createSelector(
  selectExpenseState,
  (state: ExpenseState) => state?.error,
);
export const getExpenseErrorPipe = pipe(
  select(selectExpenseError),
  filter((val): val is IError => val !== undefined),
);

const selectExpenseIsLoading = createSelector(
  selectExpenseState,
  (state: ExpenseState) => state?.isLoading,
);
export const getExpenseIsLoadingPipe = pipe(
  select(selectExpenseIsLoading),
  filter((val): val is boolean => val !== undefined),
);
