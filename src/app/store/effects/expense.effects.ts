import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  CreateExpense,
  DeleteExpense,
  ExpenseActionTypes,
  ExpenseFailure,
  ExpenseInfoSuccess,
  ExpenseSaveSuccess,
  ExpenseSelected,
  ExpenseSuccess,
  GetExpense,
  GetAllExpensesInfo,
  GetExpensesPage,
  UpdateExpense,
} from '../expense.actions';
import { TranslateService } from '@ngx-translate/core';
import { ExpenseService } from '../../services/expense.service';
import { Router } from '@angular/router';
import { IExpense, IExpenseInfo } from '../../interfaces/expense';
import { IApiResponse, success } from '../../interfaces/common';

@Injectable()
export class ExpenseEffects {

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(ExpenseActionTypes.getExpensesPage),
    switchMap((action: GetExpensesPage) =>
      this.expenseService.getExpensesPage(action.roomId, action.sort, action.direction,
        action.page, action.size, action.filter, action.dateFilter).pipe(
        switchMap((response: IExpense[]) => of(new ExpenseSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new ExpenseFailure(err.error))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(ExpenseActionTypes.getExpense),
    switchMap((action: GetExpense) =>
      this.expenseService.getExpense(action.roomId, action.id).pipe(
        switchMap((expense?: IExpense) => of(new ExpenseSelected(expense))),
        catchError((err: HttpErrorResponse) => of(new ExpenseFailure(err.error))),
      )),
  ));

  getInfo$ = createEffect(() => this.actions.pipe(
    ofType(ExpenseActionTypes.getAllExpensesInfo),
    switchMap((action: GetAllExpensesInfo) =>
      this.expenseService.getAllExpensesInfo(action.roomId).pipe(
        switchMap((info: IExpenseInfo) => of(new ExpenseInfoSuccess(info))),
        catchError((err: HttpErrorResponse) => of(new ExpenseFailure(err.error))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(ExpenseActionTypes.createExpense),
    switchMap((action: CreateExpense) =>
      this.expenseService.createExpense(action.roomId, action.expense).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('EXPENSE.CREATED', {
            invoice: response.name,
          });
          const path = `rooms/${ action.roomId }/expenses/${ response.id }`;
          return success(ExpenseSaveSuccess, message, path);
        }),
        catchError((err: HttpErrorResponse) => of(new ExpenseFailure(err.error))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(ExpenseActionTypes.updateExpense),
    switchMap((action: UpdateExpense) =>
      this.expenseService.updateExpense(action.roomId, action.expense).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('EXPENSE.UPDATED.MESSAGE', { invoice: response.name });
          const path = `rooms/${ action.roomId }/expenses/${ response.id }`;
          return success(ExpenseSaveSuccess, message, path);
        }),
        catchError((err: HttpErrorResponse) => of(new ExpenseFailure(err.error))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(ExpenseActionTypes.deleteExpense),
    switchMap((action: DeleteExpense) =>
      this.expenseService.deleteExpense(action.roomId, action.id).pipe(
        switchMap(() => {
          const message = this.translate.instant('EXPENSE.DELETED.MESSAGE', { invoice: action.invoice });
          return success(ExpenseSaveSuccess, message, undefined, undefined, 'warning');
        }),
        catchError((err: HttpErrorResponse) => of(new ExpenseFailure(err.error))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(ExpenseActionTypes.expenseSelected),
    tap((data: ExpenseSelected) => this.router.navigate(
      [this.translate.currentLang, 'rooms', data.selected?.room?.id, 'expenses',
        data.selected?.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ExpenseActionTypes.expenseSuccess),
  ), { dispatch: false });

  infoSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ExpenseActionTypes.expenseInfoSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ExpenseActionTypes.expenseSaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions,
              private expenseService: ExpenseService, private router: Router) {
  }
}
