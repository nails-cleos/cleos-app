import {
  cleanStatement,
  getStatementsPage,
  statementFailure,
  statementSaveSuccess,
  statementSuccess,
  statementView,
  uploadStatement,
} from '../statement.actions';
import { IStatement } from '../../interfaces/statement';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';
import { Pagination } from '../../interfaces/pagination';

export const STATEMENT_FEATURE_KEY = 'statement';

export interface StatementState {
  response?: IResponseSuccess;
  page?: Pagination<IStatement>;
  error?: IError;
  subErrors?: IError[];
  isLoading: boolean;
}

export const initialState: StatementState = {
  response: undefined,
  page: undefined,
  error: undefined,
  subErrors: undefined,
  isLoading: false,
};

export const statementReducer = createReducer(
  initialState,
  on(getStatementsPage, (state) => ({
    ...state,
    page: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IStatement>,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(statementSuccess, (state, { page }) => ({
    ...state,
    page,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(statementFailure, (state, { error }) => ({
    ...state,
    error: error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(statementView, (state) => ({
    ...state,
    isLoading: true,
    error: undefined,
    subErrors: undefined,
    response: undefined,
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
