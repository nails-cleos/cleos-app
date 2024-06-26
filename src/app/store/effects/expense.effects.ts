import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsExpense from '../expense.actions';
import { TranslateService } from '@ngx-translate/core';
import { ExpenseService } from '../../services/expense.service';
import { Router } from '@angular/router';

@Injectable()
export class ExpenseEffects {

  getAll$ = createEffect(() => this.actions.pipe(ofType(fromActionsExpense.ExpenseActionTypes.getAll)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.expenseService.getAll(payload.roomId, payload.active, payload.direction, payload.page,
      payload.size, payload.filter, payload.dateFilter).pipe(
      switchMap((response: any) => of(new fromActionsExpense.ExpenseSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsExpense.ExpenseFailure({ error: err.error })))
    ))
  ));

  findOne$ = createEffect(() => this.actions.pipe(ofType(fromActionsExpense.ExpenseActionTypes.expenseFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.expenseService.getById(payload.roomId, payload.id).pipe(
      switchMap((expense: any) => of(new fromActionsExpense.ExpenseSelected({ expense }))),
      catchError((err: HttpErrorResponse) => of(new fromActionsExpense.ExpenseFailure({ error: err.error })))
    ))
  ));

  getInfo$ = createEffect(() => this.actions.pipe(ofType(fromActionsExpense.ExpenseActionTypes.getExpenseInfo)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.expenseService.getExpenseInfo(payload).pipe(
      switchMap((expense: any) => of(new fromActionsExpense.ExpenseInfoSuccess(expense))),
      catchError((err: HttpErrorResponse) => of(new fromActionsExpense.ExpenseFailure({ error: err.error })))
    ))
  ));

  save$ = createEffect(() => this.actions.pipe(ofType(fromActionsExpense.ExpenseActionTypes.expenseSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.expenseService.add(payload.roomId, payload.expense).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('EXPENSE.CREATED', { invoice: response.invoice });
        return of(new fromActionsExpense.ExpenseSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsExpense.ExpenseFailure({ error: err.error })))
    ))
  ));

  update = createEffect(() => this.actions.pipe(ofType(fromActionsExpense.ExpenseActionTypes.expenseUpdate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.expenseService.update(payload.roomId, payload.expense).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('EXPENSE.UPDATED.MESSAGE', { invoice: response.invoice });
        return of(new fromActionsExpense.ExpenseSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsExpense.ExpenseFailure({ error: err.error })))
    ))
  ));

  delete$ = createEffect(() => this.actions.pipe(ofType(fromActionsExpense.ExpenseActionTypes.expenseDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.expenseService.delete(payload.roomId, payload.id).pipe(
      switchMap(() => {
        const message = this.translate.instant('EXPENSE.DELETED.MESSAGE', { invoice: payload.invoice });
        return of(new fromActionsExpense.ExpenseSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsExpense.ExpenseFailure({ error: err.error })))
    ))
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsExpense.ExpenseActionTypes.expenseSelected),
    tap((data: any) => this.router.navigate([this.translate.currentLang, 'rooms', data.payload.expense.room.id, 'expenses',
      data.payload.expense.id]))
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsExpense.ExpenseActionTypes.expenseSuccess)
  ), { dispatch: false });

  infoSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsExpense.ExpenseActionTypes.expenseInfoSuccess)
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsExpense.ExpenseActionTypes.expenseSaveSuccess)
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions,
              private expenseService: ExpenseService, private router: Router) {
  }
}
