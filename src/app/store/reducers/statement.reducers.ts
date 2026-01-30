import { cleanStatement, statementFailure, statementSaveSuccess, uploadStatement } from '../statement.actions';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';

export const STATEMENT_FEATURE_KEY = 'statement';

export interface StatementState {
  response?: IResponseSuccess;
  error?: IError;
  subErrors?: IError[];
  isLoading: boolean;
}

export const initialState: StatementState = {
  response: undefined,
  error: undefined,
  subErrors: undefined,
  isLoading: false,
};

export const statementReducer = createReducer(
  initialState,
  on(statementFailure, (state, { error }) => ({
    ...state,
    error: error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(uploadStatement, (state) => ({
    ...state,
    isLoading: true,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(statementSaveSuccess, (state, action) => ({
    ...state,
    isLoading: false,
    error: undefined,
    subErrors: undefined,
    response: action,
  })),
  on(cleanStatement, () => initialState),
);
