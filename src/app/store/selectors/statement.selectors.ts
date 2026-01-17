import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { STATEMENT_FEATURE_KEY, StatementState } from '../reducers/statement.reducers';
import { IResponseSuccess } from '../../interfaces/common';

const selectStatementState = createFeatureSelector<StatementState>(STATEMENT_FEATURE_KEY);

export const selectStatementIsLoading = createSelector(
  selectStatementState,
  (state: StatementState) => state?.isLoading,
);

export const selectStatementError = createSelector(
  selectStatementState,
  (state: StatementState) => state?.error,
);

export const selectStatementResponse = createSelector(
  selectStatementState,
  (state: StatementState) => state?.response,
);
export const getStatementResponsePipe = pipe(
  select(selectStatementResponse),
  filter((val): val is IResponseSuccess => val !== undefined),
);
