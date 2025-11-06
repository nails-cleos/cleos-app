import { createReducer, on } from '@ngrx/store';
import {
  clean,
  createExpense,
  deleteExpense,
  expenseFailure,
  expenseInfoSuccess,
  expenseSaveSuccess,
  expenseSelected,
  expenseSuccess,
  getAllExpensesInfo,
  getExpense,
  getExpensesPage,
  updateExpense,
} from '../expense.actions';
import { Pagination } from '../../interfaces/pagination';
import { IExpense, IExpenseInfo } from '../../interfaces/expense';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: Pagination<IExpense> | IExpense[];
  info?: IExpenseInfo;
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IExpense;
  isLoading: boolean;
}

export const initialState: State = {
  response: undefined,
  data: undefined,
  info: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  isLoading: false,
};

export const expenseReducer = createReducer(
  initialState,
  on(getExpensesPage, (state) => ({
    ...state,
    data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IExpense>,
    response: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
  })),
  on(getAllExpensesInfo, (state) => ({
    ...state,
    response: undefined,
    info: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
  })),
  on(getExpense, (state) => ({
    ...state,
    selected: {} as IExpense,
    response: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),
  on(expenseSuccess, (state, { data }) => ({
    ...state,
    data,
    response: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),
  on(expenseInfoSuccess, (state, { info }) => ({
    ...state,
    info,
    response: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),
  on(expenseSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(expenseSelected, (state, { selected }) => ({
    ...state,
    selected,
    response: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),
  on(expenseFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(
    createExpense,
    updateExpense,
    deleteExpense,
    (state) => ({
      ...state,
      response: undefined,
      errorMessage: undefined,
      subErrors: undefined,
      isLoading: true,
    }),
  ),
  on(clean, () => initialState),
);
