import { Action } from '@ngrx/store';

export enum ExpenseActionTypes {
  getExpensesPage = '[Expense] Get expenses page',
  getAllExpensesInfo = '[Expense] Get all expenses info',
  expenseSuccess = '[Expense] Success',
  expenseInfoSuccess = '[Expense] Info success',
  createExpense = '[Expense] Create expense',
  updateExpenseById = '[Expense] Update expense by id',
  expenseSaveSuccess = '[Expense] Save Success',
  expenseFailure = '[Expense] Failure',
  expenseSelected = '[Expense] Selected',
  findExpenseById = '[Expense] Find expense by id',
  deleteExpenseById = '[Expense] Delete expense by id',
  clean = '[Expense] Clean'
}

export class GetExpensesPage implements Action {
  readonly type = ExpenseActionTypes.getExpensesPage;

  constructor(public payload: any) {
  }
}

export class GetAllExpensesInfo implements Action {
  readonly type = ExpenseActionTypes.getAllExpensesInfo;

  constructor(public payload: any) {
  }
}

export class ExpenseSuccess implements Action {
  readonly type = ExpenseActionTypes.expenseSuccess;

  constructor(public payload: any) {
  }
}

export class ExpenseInfoSuccess implements Action {
  readonly type = ExpenseActionTypes.expenseInfoSuccess;

  constructor(public payload: any) {
  }
}

export class CreateExpense implements Action {
  readonly type = ExpenseActionTypes.createExpense;

  constructor(public payload: any) {
  }
}

export class UpdateExpenseById implements Action {
  readonly type = ExpenseActionTypes.updateExpenseById;

  constructor(public payload: any) {
  }
}

export class ExpenseSaveSuccess implements Action {
  readonly type = ExpenseActionTypes.expenseSaveSuccess;

  constructor(public payload: any) {
  }
}

export class ExpenseFailure implements Action {
  readonly type = ExpenseActionTypes.expenseFailure;

  constructor(public payload: any) {
  }
}

export class ExpenseSelected implements Action {
  readonly type = ExpenseActionTypes.expenseSelected;

  constructor(public payload: any) {
  }
}

export class FindExpenseById implements Action {
  readonly type = ExpenseActionTypes.findExpenseById;

  constructor(public payload: any) {
  }
}

export class DeleteExpenseById implements Action {
  readonly type = ExpenseActionTypes.deleteExpenseById;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = ExpenseActionTypes.clean;
}

export type All =
  | GetExpensesPage
  | GetAllExpensesInfo
  | CreateExpense
  | UpdateExpenseById
  | ExpenseSuccess
  | ExpenseInfoSuccess
  | ExpenseSaveSuccess
  | ExpenseFailure
  | FindExpenseById
  | ExpenseSelected
  | DeleteExpenseById
  | Clean;
