import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsAccount from '../account.actions';
import { TranslateService } from '@ngx-translate/core';
import { AccountService } from '../../services/account.service';
import { PaymentService } from '../../services/payment.service';

@Injectable()
export class AccountEffects {

  findOne$ = createEffect(() => this.actions.pipe(ofType(fromActionsAccount.AccountActionTypes.accountFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.accountService.getById(payload).pipe(
      switchMap((account: any) => of(new fromActionsAccount.AccountSelected(account))),
      catchError((err: HttpErrorResponse) => of(new fromActionsAccount.AccountFailure({ error: err.error }))),
    )),
  ));

  findTransaction$ = createEffect(
    () => this.actions.pipe(ofType(fromActionsAccount.AccountActionTypes.accountTransactionDetail)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.accountService.findTransaction(payload.id, payload.transactionId).pipe(
        switchMap((account: any) => of(new fromActionsAccount.AccountSelected(account))),
        catchError((err: HttpErrorResponse) => of(new fromActionsAccount.AccountFailure({ error: err.error }))),
      )),
    ));

  paymentOptions$ = createEffect(
    () => this.actions.pipe(ofType(fromActionsAccount.AccountActionTypes.paymentOptions)).pipe(
      map((action: any) => action.payload),
      switchMap(() => this.paymentService.paymentOptions().pipe(
        switchMap((response: any) => of(new fromActionsAccount.PaymentOptionsSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new fromActionsAccount.AccountFailure({ error: err.error }))),
      )),
    ));

  findAllTransaction$ = createEffect(
    () => this.actions.pipe(ofType(fromActionsAccount.AccountActionTypes.accountFindTransactions)).pipe(
      map((action: any) => action.payload),
      switchMap(
        (payload: any) => this.accountService.getAllTransactions(payload.accountId, payload.page, payload.active,
          payload.direction, payload.size).pipe(
          switchMap((transactions: any) => of(new fromActionsAccount.AccountSuccess(transactions))),
          catchError((err: HttpErrorResponse) => of(new fromActionsAccount.AccountFailure({ error: err.error }))),
        )),
    ));

  findByCustomer$ = createEffect(
    () => this.actions.pipe(ofType(fromActionsAccount.AccountActionTypes.accountFindByCustomer)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.accountService.findByCustomer(payload).pipe(
        switchMap((account: any) => of(new fromActionsAccount.AccountSelected(account))),
        catchError((err: HttpErrorResponse) => of(new fromActionsAccount.AccountFailure({ error: err.error }))),
      )),
    ));

  save$ = createEffect(() => this.actions.pipe(ofType(fromActionsAccount.AccountActionTypes.accountSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.accountService.add(payload.transaction, payload.accountId).pipe(
      switchMap((response: any) => {
        if (response.paymentLink) {
          return of(new fromActionsAccount.PaymentSend(response.paymentLink));
        } else {
          const message = this.translate.instant('ACCOUNT.MONEY_ADDED', { id: response.account.id });
          return of(new fromActionsAccount.AccountSaveSuccess({ message }));
        }
      }), catchError((err: HttpErrorResponse) => of(new fromActionsAccount.AccountFailure({ error: err.error }))),
    )),
  ));

  update = createEffect(() => this.actions.pipe(ofType(fromActionsAccount.AccountActionTypes.accountUpdate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.accountService.update(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('ACCOUNT.UPDATED', { id: response.id });
        return of(new fromActionsAccount.AccountSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsAccount.AccountFailure({ error: err.error }))),
    )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsAccount.AccountActionTypes.accountSelected),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsAccount.AccountActionTypes.accountSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsAccount.AccountActionTypes.accountSaveSuccess),
  ), { dispatch: false });

  send$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsAccount.AccountActionTypes.paymentSend),
    tap((data: any) => window.open(data.payload, '_self')),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions,
              private accountService: AccountService, private paymentService: PaymentService) {
  }
}
