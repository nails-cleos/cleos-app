import { Action } from '@ngrx/store';

export enum ExpenseActionTypes {
  getAll = '[Expense] Get all',
  getExpenseInfo = '[Expense] Get info',
  expenseSuccess = '[Expense] Success',
  expenseInfoSuccess = '[Expense] Info success',
  expenseSave = '[Expense] Save',
  expenseUpdate = '[Expense] Update',
  expenseSaveSuccess = '[Expense] Save Success',
  expenseFailure = '[Expense] Failure',
  expenseSelected = '[Expense] Selected',
  expenseFind = '[Expense] Find',
  expenseDelete = '[Expense] Delete',
  clean = '[Expense] Clean'
}

export class GetAll implements Action {
  readonly type = ExpenseActionTypes.getAll;

  constructor(public payload: any) {
  }
}


export class GetExpenseInfo implements Action {
  readonly type = ExpenseActionTypes.getExpenseInfo;

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

export class ExpenseSave implements Action {
  readonly type = ExpenseActionTypes.expenseSave;

  constructor(public payload: any) {
  }
}

export class ExpenseUpdate implements Action {
  readonly type = ExpenseActionTypes.expenseUpdate;

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

export class ExpenseFind implements Action {
  readonly type = ExpenseActionTypes.expenseFind;

  constructor(public payload: any) {
  }
}

export class DeleteExpense implements Action {
  readonly type = ExpenseActionTypes.expenseDelete;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = ExpenseActionTypes.clean;
}

export type All =
  | GetAll
  | GetExpenseInfo
  | ExpenseSave
  | ExpenseUpdate
  | ExpenseSuccess
  | ExpenseInfoSuccess
  | ExpenseSaveSuccess
  | ExpenseFailure
  | ExpenseFind
  | ExpenseSelected
  | DeleteExpense
  | Clean;
