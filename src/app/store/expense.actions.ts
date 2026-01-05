import { createAction, props } from '@ngrx/store';
import { IExpense, IExpenseAll, IExpenseInfo } from '../interfaces/expense';
import { IError, IResponseSuccess, PageRequest } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';

enum ExpenseActionTypes {
  getExpensesPage = '[Expense] Get expenses page',
  getAllExpensesInfo = '[Expense] Get all expenses info',
  expenseSuccess = '[Expense] Success',
  expenseInfoSuccess = '[Expense] Info success',
  createExpense = '[Expense] Create expense',
  updateExpense = '[Expense] Update expense by id',
  expenseSaveSuccess = '[Expense] Save Success',
  expenseFailure = '[Expense] Failure',
  expenseSelected = '[Expense] Selected',
  getExpense = '[Expense] Find expense by id',
  deleteExpense = '[Expense] Delete expense by id',
  setCurrentExpenseId = '[Expense] Set current expense id',
  clean = '[Expense] Clean',
}

export const getExpensesPage = createAction(
  ExpenseActionTypes.getExpensesPage,
  props<PageRequest & {
    roomId: string;
    filter?: string;
    dateFilter?: string;
  }>(),
);

export const getAllExpensesInfo = createAction(
  ExpenseActionTypes.getAllExpensesInfo,
  props<{ roomId: string }>(),
);

export const expenseSuccess = createAction(
  ExpenseActionTypes.expenseSuccess,
  props<{ data: Pagination<IExpenseAll> }>(),
);

export const expenseInfoSuccess = createAction(
  ExpenseActionTypes.expenseInfoSuccess,
  props<{ info: IExpenseInfo }>(),
);

export const createExpense = createAction(
  ExpenseActionTypes.createExpense,
  props<{ roomId: string; expense: IExpense }>(),
);

export const updateExpense = createAction(
  ExpenseActionTypes.updateExpense,
  props<{ id: string; roomId: string; expense: IExpense }>(),
);

export const expenseSaveSuccess = createAction(
  ExpenseActionTypes.expenseSaveSuccess,
  props<IResponseSuccess>(),
);

export const expenseFailure = createAction(
  ExpenseActionTypes.expenseFailure,
  props<{ error: IError }>(),
);

export const expenseSelected = createAction(
  ExpenseActionTypes.expenseSelected,
  props<{ selected?: IExpenseAll }>(),
);

export const getExpense = createAction(
  ExpenseActionTypes.getExpense,
  props<{ roomId: string; id: string }>(),
);

export const deleteExpense = createAction(
  ExpenseActionTypes.deleteExpense,
  props<{ roomId: string; id: string; invoice: string }>(),
);

export const setCurrentExpenseId = createAction(
  ExpenseActionTypes.setCurrentExpenseId,
  props<{ expenseId: string }>(),
);

export const cleanExpense = createAction(ExpenseActionTypes.clean);
