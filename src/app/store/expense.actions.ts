import { Action } from '@ngrx/store';
import { IExpense, IExpenseInfo } from '../interfaces/expense';
import { IError, PageRequest, ResponseSuccess } from '../interfaces/common';
import { SortDirection } from '@angular/material/sort';

export enum ExpenseActionTypes {
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
  clean = '[Expense] Clean'
}

export class GetExpensesPage extends PageRequest implements Action {
  readonly type = ExpenseActionTypes.getExpensesPage;

  constructor(public roomId: string, public sort: string, public direction: SortDirection, public page: number,
              public size: number, public filter?: string, public dateFilter?: string) {
    super(page, sort, direction, size);
  }
}

export class GetAllExpensesInfo implements Action {
  readonly type = ExpenseActionTypes.getAllExpensesInfo;

  constructor(public roomId: string) {
  }
}

export class ExpenseSuccess implements Action {
  readonly type = ExpenseActionTypes.expenseSuccess;

  constructor(public data: IExpense[]) {
  }
}

export class ExpenseInfoSuccess implements Action {
  readonly type = ExpenseActionTypes.expenseInfoSuccess;

  constructor(public info: IExpenseInfo) {
  }
}

export class CreateExpense implements Action {
  readonly type = ExpenseActionTypes.createExpense;

  constructor(public roomId: string, public expense: IExpense) {
  }
}

export class UpdateExpense implements Action {
  readonly type = ExpenseActionTypes.updateExpense;

  constructor(public roomId: string, public expense: IExpense) {
  }
}

export class ExpenseSaveSuccess extends ResponseSuccess implements Action {
  readonly type = ExpenseActionTypes.expenseSaveSuccess;
}

export class ExpenseFailure implements Action {
  readonly type = ExpenseActionTypes.expenseFailure;

  constructor(public error: IError) {
  }
}

export class ExpenseSelected implements Action {
  readonly type = ExpenseActionTypes.expenseSelected;

  constructor(public selected?: IExpense) {
  }
}

export class GetExpense implements Action {
  readonly type = ExpenseActionTypes.getExpense;

  constructor(public roomId: string, public id: string) {
  }
}

export class DeleteExpense implements Action {
  readonly type = ExpenseActionTypes.deleteExpense;

  constructor(public roomId: string, public id: string, public invoice: string) {
  }
}

export class Clean implements Action {
  readonly type = ExpenseActionTypes.clean;
}

export type All =
  | GetExpensesPage
  | GetAllExpensesInfo
  | CreateExpense
  | UpdateExpense
  | ExpenseSuccess
  | ExpenseInfoSuccess
  | ExpenseSaveSuccess
  | ExpenseFailure
  | GetExpense
  | ExpenseSelected
  | DeleteExpense
  | Clean;
