import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import {
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
import { IExpenseAll, IExpenseInfo } from '../../interfaces/expense';
import { IApiResponse, success } from '../../interfaces/common';
import { Pagination } from '../../interfaces/pagination';

@Injectable()
export class ExpenseEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly expenseService: ExpenseService = inject(ExpenseService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions$.pipe(
    ofType(getExpensesPage),
    switchMap(({ roomId, sort, direction, page, size, filter, dateFilter }) =>
      this.expenseService.getExpensesPage(roomId, sort, direction, page, size, filter, dateFilter)
        .pipe(map((data: Pagination<IExpenseAll>) => expenseSuccess({ data })),
          catchError((err: HttpErrorResponse) => of(expenseFailure({ error: err.error }))),
        )),
  ));

  findOne$ = createEffect(() => this.actions$.pipe(
    ofType(getExpense),
    switchMap(({ roomId, id }) =>
      this.expenseService.getExpense(roomId, id).pipe(
        map((selected?: IExpenseAll) => expenseSelected({ selected })),
        catchError((err: HttpErrorResponse) => of(expenseFailure({ error: err.error }))),
      )),
  ));

  getInfo$ = createEffect(() => this.actions$.pipe(
    ofType(getAllExpensesInfo),
    switchMap(({ roomId }) =>
      this.expenseService.getAllExpensesInfo(roomId).pipe(
        map((info: IExpenseInfo) => expenseInfoSuccess({ info })),
        catchError((err: HttpErrorResponse) => of(expenseFailure({ error: err.error }))),
      )),
  ));

  create$ = createEffect(() => this.actions$.pipe(
    ofType(createExpense),
    switchMap(({ roomId, expense, file }) =>
      this.expenseService.createExpense(roomId, expense, file).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('EXPENSE.CREATED', { invoice: response.name });
          const path = `rooms/${roomId}/expenses/${response.id}`;
          return success(expenseSaveSuccess, message, path);
        }),
        catchError((err: HttpErrorResponse) => of(expenseFailure({ error: err.error }))),
      )),
  ));

  update$ = createEffect(() => this.actions$.pipe(
    ofType(updateExpense),
    switchMap(({ id, roomId, expense, file }) =>
      this.expenseService.updateExpense(id, roomId, expense, file).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('EXPENSE.UPDATED.MESSAGE', { invoice: response.name });
          const path = `rooms/${roomId}/expenses/${response.id}`;
          return success(expenseSaveSuccess, message, path);
        }),
        catchError((err: HttpErrorResponse) => of(expenseFailure({ error: err.error }))),
      )),
  ));

  delete$ = createEffect(() => this.actions$.pipe(
    ofType(deleteExpense),
    switchMap(({ roomId, id, invoice }) =>
      this.expenseService.deleteExpense(roomId, id).pipe(
        switchMap(() => {
          const message = this.translate.instant('EXPENSE.DELETED.MESSAGE', { invoice });
          return success(expenseSaveSuccess, message, undefined, true, 'warning');
        }),
        catchError((err: HttpErrorResponse) => of(expenseFailure({ error: err.error }))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions$.pipe(
    ofType(expenseSelected),
    tap(({ selected }) => {
      const roomId = selected?.room?.id;
      const expenseId = selected?.id;
      if (!roomId || !expenseId) {
        return;
      }
      this.router.navigate([this.translate.getCurrentLang(), 'rooms', roomId, 'expenses', expenseId]);
    }),
  ), { dispatch: false });

  infoSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(expenseInfoSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(expenseSaveSuccess),
  ), { dispatch: false });
}
