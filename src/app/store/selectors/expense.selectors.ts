import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IExpenseAll, IExpenseInfo } from '../../interfaces/expense';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { EXPENSE_FEATURE_KEY, ExpenseState } from '../reducers/expense.reducers';

const selectExpenseState = createFeatureSelector<ExpenseState>(EXPENSE_FEATURE_KEY);

const selectExpensePaginationData = createSelector(
  selectExpenseState,
  (state: ExpenseState) => state?.data,
);
export const getExpensePaginationPipe = pipe(select(selectExpensePaginationData));

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

export const selectExpenseResponse = createSelector(
  selectExpenseState,
  (state: ExpenseState) => state?.response,
);
export const getExpenseResponsePipe = pipe(
  select(selectExpenseResponse),
  filter((val): val is IResponseSuccess => val !== undefined),
);

export const selectExpenseError = createSelector(
  selectExpenseState,
  (state: ExpenseState) => state?.error,
);

export const selectExpenseIsLoading = createSelector(
  selectExpenseState,
  (state: ExpenseState) => state?.isLoading,
);
