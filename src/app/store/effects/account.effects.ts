import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  accountFailure,
  accountSaveSuccess,
  accountSelected,
  accountSuccess,
  createTransaction,
  getAccount,
  getAccountByCustomerId,
  getTransaction,
  getTransactionsByAccountId,
  paymentOptions,
  paymentOptionsSuccess,
  paymentSend,
  updateAccount,
} from '../account.actions';
import { TranslateService } from '@ngx-translate/core';
import { AccountService } from '../../services/account.service';
import { PaymentService } from '../../services/payment.service';
import { IAccount, ITransaction } from '../../interfaces/account';
import { IPaymentOption } from '../../interfaces/payment';
import { IApiResponse, success } from '../../interfaces/common';

@Injectable()
export class AccountEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly accountService: AccountService = inject(AccountService);
  private readonly paymentService: PaymentService = inject(PaymentService);

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getAccount),
    switchMap(({ id }) =>
      this.accountService.getAccount(id).pipe(
        map((selected?: IAccount) => accountSelected({ selected })),
        catchError((err: HttpErrorResponse) => of(accountFailure({ error: err.error }))),
      )),
  ));

  findTransaction$ = createEffect(() => this.actions.pipe(
    ofType(getTransaction),
    switchMap(({ id, transactionId }) =>
      this.accountService.getTransaction(id, transactionId).pipe(
        map((selected?: ITransaction) => accountSelected({ selected })),
        catchError((err: HttpErrorResponse) => of(accountFailure({ error: err.error }))),
      )),
  ));

  paymentOptions$ = createEffect(() => this.actions.pipe(
    ofType(paymentOptions),
    switchMap(() =>
      this.paymentService.getPaymentOptions().pipe(
        map((paymentOptions?: IPaymentOption[]) => paymentOptionsSuccess({ paymentOptions })),
        catchError((err: HttpErrorResponse) => of(accountFailure({ error: err.error }))),
      )),
  ));

  findAllTransaction$ = createEffect(() => this.actions.pipe(
    ofType(getTransactionsByAccountId),
    switchMap(({ id, page, sort, direction, size }) =>
      this.accountService.getTransactionsByAccountId(id, page, sort, direction, size).pipe(
        map((transactions: ITransaction[]) => accountSuccess({ data: transactions })),
        catchError((err: HttpErrorResponse) => of(accountFailure({ error: err.error }))),
      )),
  ));

  findByCustomer$ = createEffect(() => this.actions.pipe(
    ofType(getAccountByCustomerId),
    switchMap(({ customerId }) =>
      this.accountService.getAccountByCustomerId(customerId).pipe(
        map((selected?: IAccount) => accountSelected({ selected })),
        catchError((err: HttpErrorResponse) => of(accountFailure({ error: err.error }))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createTransaction),
    switchMap(({ id, transaction }) =>
      this.accountService.createTransaction(id, transaction).pipe(
        switchMap((response: IApiResponse) => {
          if (response.paymentLink) {
            return of(paymentSend({ link: response.paymentLink }));
          } else {
            const message = this.translate.instant('ACCOUNT.MONEY_ADDED', { id: id });
            const path = `accounts/${id}/transactions/${response.id}`;
            return success(accountSaveSuccess, message, path);
          }
        }),
        catchError((err: HttpErrorResponse) => of(accountFailure({ error: err.error }))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateAccount),
    switchMap(({ id, transaction, customerId }) =>
      this.accountService.updateAccount(id, transaction).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('ACCOUNT.UPDATED', { id: response.id });
          return success(accountSaveSuccess, message, `accounts/customers/${customerId}`);
        }),
        catchError((err: HttpErrorResponse) => of(accountFailure({ error: err.error }))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(accountSelected),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(accountSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(accountSaveSuccess),
  ), { dispatch: false });

  send$ = createEffect(() => this.actions.pipe(
    ofType(paymentSend),
    tap(({ link }) => window.open(link, '_self')),
  ), { dispatch: false });
}
