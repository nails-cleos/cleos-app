import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import * as fromActionsExpense from '../expense.actions';
import {
  CreateExpense, DeleteExpenseById,
  FindExpenseById,
  GetAllExpensesInfo,
  GetExpensesPage,
  UpdateExpenseById,
} from '../expense.actions';
import { TranslateService } from '@ngx-translate/core';
import { ExpenseService } from '../../services/expense.service';
import { Router } from '@angular/router';

@Injectable()
export class ExpenseEffects {

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsExpense.ExpenseActionTypes.getExpensesPage),
    switchMap((action: GetExpensesPage) =>
      this.expenseService.getExpensesPage(action.roomId, action.sort, action.direction,
        action.page, action.size, action.filter, action.dateFilter).pipe(
        switchMap((response: any) => of(new fromActionsExpense.ExpenseSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new fromActionsExpense.ExpenseFailure({ error: err.error }))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsExpense.ExpenseActionTypes.findExpenseById),
    switchMap((action: FindExpenseById) =>
      this.expenseService.findExpenseById(action.roomId, action.id).pipe(
        switchMap((expense: any) => of(new fromActionsExpense.ExpenseSelected({ expense }))),
        catchError((err: HttpErrorResponse) => of(new fromActionsExpense.ExpenseFailure({ error: err.error }))),
      )),
  ));

  getInfo$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsExpense.ExpenseActionTypes.getAllExpensesInfo),
    switchMap((action: GetAllExpensesInfo) =>
      this.expenseService.getAllExpensesInfo(action.roomId).pipe(
        switchMap((expense: any) => of(new fromActionsExpense.ExpenseInfoSuccess(expense))),
        catchError((err: HttpErrorResponse) => of(new fromActionsExpense.ExpenseFailure({ error: err.error }))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsExpense.ExpenseActionTypes.createExpense),
    switchMap((action: CreateExpense) =>
      this.expenseService.createExpense(action.roomId, action.expense).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('EXPENSE.CREATED', {
            invoice: response.invoice,
          });
          return of(new fromActionsExpense.ExpenseSaveSuccess(
            { message, path: `rooms/${ action.roomId }/expenses/${ response.id }` }));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsExpense.ExpenseFailure({ error: err.error }))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsExpense.ExpenseActionTypes.updateExpenseById),
    switchMap((action: UpdateExpenseById) =>
      this.expenseService.updateExpenseById(action.roomId, action.expense).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('EXPENSE.UPDATED.MESSAGE', { invoice: response.invoice });
          return of(new fromActionsExpense.ExpenseSaveSuccess(
            { message, path: `rooms/${ action.roomId }/expenses/${ response.id }` }));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsExpense.ExpenseFailure({ error: err.error }))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsExpense.ExpenseActionTypes.deleteExpenseById),
    switchMap((action: DeleteExpenseById) =>
      this.expenseService.deleteExpenseById(action.roomId, action.id).pipe(
        switchMap(() => {
          const message = this.translate.instant('EXPENSE.DELETED.MESSAGE', { invoice: action.invoice });
          return of(new fromActionsExpense.ExpenseSaveSuccess({ message }));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsExpense.ExpenseFailure({ error: err.error }))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsExpense.ExpenseActionTypes.expenseSelected),
    tap((data: any) => this.router.navigate(
      [this.translate.currentLang, 'rooms', data.payload.expense.room.id, 'expenses',
        data.payload.expense.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsExpense.ExpenseActionTypes.expenseSuccess),
  ), { dispatch: false });

  infoSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsExpense.ExpenseActionTypes.expenseInfoSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsExpense.ExpenseActionTypes.expenseSaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions,
              private expenseService: ExpenseService, private router: Router) {
  }
}
