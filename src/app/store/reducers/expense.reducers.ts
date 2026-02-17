import { createReducer, on } from '@ngrx/store';
import {
  cleanExpense,
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
  setCurrentExpenseId,
  updateExpense,
} from '../expense.actions';
import { Pagination } from '../../interfaces/pagination';
import { IExpenseAll, IExpenseInfo } from '../../interfaces/expense';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { clearGlobalError, clearGlobalResponse } from '../global.actions';

export const EXPENSE_FEATURE_KEY = 'expense';

export interface ExpenseState {
  response?: IResponseSuccess;
  data?: Pagination<IExpenseAll>;
  info?: IExpenseInfo;
  error?: IError;
  subErrors?: IError[];
  selected?: IExpenseAll;
  currentRoomId?: string;
  currentExpenseId?: string;
  isLoading: boolean;
}

export const initialState: ExpenseState = {
  response: undefined,
  data: undefined,
  info: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  currentRoomId: undefined,
  currentExpenseId: undefined,
  isLoading: false,
};

export const expenseReducer = createReducer(
  initialState,
  on(getExpensesPage, (state) => ({
    ...state,
    data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IExpenseAll>,
    response: undefined,
    subErrors: undefined,
    selected: undefined,
  })),
  on(getAllExpensesInfo, (state) => ({
    ...state,
    response: undefined,
    info: undefined,
    subErrors: undefined,
    selected: undefined,
  })),
  on(getExpense, (state) => ({
    ...state,
    selected: {} as IExpenseAll,
    response: undefined,
    subErrors: undefined,
  })),
  on(expenseSuccess, (state, { data }) => ({
    ...state,
    data,
    response: undefined,
    subErrors: undefined,
  })),
  on(expenseInfoSuccess, (state, { info }) => ({
    ...state,
    info,
    response: undefined,
    subErrors: undefined,
  })),
  on(expenseSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(expenseSelected, (state, { selected }) => ({
    ...state,
    selected,
    response: undefined,
    subErrors: undefined,
  })),
  on(expenseFailure, (state, { error }) => ({
    ...state,
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
  on(setCurrentExpenseId, (state, { expenseId }) => ({
    ...state,
    currentExpenseId: expenseId,
  })),
  on(cleanExpense, () => initialState),

  on(clearGlobalResponse, (state) => ({
    ...state,
    response: undefined,
  })),

  on(clearGlobalError, (state) => ({
    ...state,
    error: undefined,
    subErrors: undefined,
  })),
);
