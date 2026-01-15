import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IStatement } from '../../interfaces/statement';
import { STATEMENT_FEATURE_KEY, StatementState } from '../reducers/statement.reducers';
import { Pagination } from '../../interfaces/pagination';
import { IResponseSuccess } from '../../interfaces/common';

const selectStatementState = createFeatureSelector<StatementState>(STATEMENT_FEATURE_KEY);

const selectStatementsPage = createSelector(
  selectStatementState,
  (state: StatementState) => state?.page,
);
export const getStatementsPagePipe = pipe(
  select(selectStatementsPage),
  filter((val): val is Pagination<IStatement> => val !== undefined),
);

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
