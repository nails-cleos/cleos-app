import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  AccountActionTypes,
  AccountFailure,
  AccountSaveSuccess,
  AccountSelected,
  AccountSuccess,
  CreateTransaction,
  GetAccountByCustomerId,
  GetAccount,
  GetTransaction,
  GetTransactionsByAccountId,
  PaymentOptionsSuccess,
  PaymentSend,
  UpdateAccount,
} from '../account.actions';
import { TranslateService } from '@ngx-translate/core';
import { AccountService } from '../../services/account.service';
import { PaymentService } from '../../services/payment.service';
import { IAccount, ITransaction } from '../../interfaces/account';
import { IPaymentOption } from '../../interfaces/payment';
import { IApiResponse, success } from '../../interfaces/common';

@Injectable()
export class AccountEffects {

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(AccountActionTypes.getAccount),
    switchMap((action: GetAccount) =>
      this.accountService.getAccount(action.id).pipe(
        switchMap((account?: IAccount) => of(new AccountSelected(account))),
        catchError((err: HttpErrorResponse) => of(new AccountFailure(err.error))),
      )),
  ));

  findTransaction$ = createEffect(() => this.actions.pipe(
    ofType(AccountActionTypes.getTransaction),
    switchMap((action: GetTransaction) =>
      this.accountService.getTransaction(action.id, action.transactionId).pipe(
        switchMap((transaction?: ITransaction) => of(new AccountSelected(transaction))),
        catchError((err: HttpErrorResponse) => of(new AccountFailure(err.error))),
      )),
  ));

  paymentOptions$ = createEffect(() => this.actions.pipe(
    ofType(AccountActionTypes.paymentOptions),
    switchMap(() =>
      this.paymentService.getPaymentOptions().pipe(
        switchMap((response?: IPaymentOption[]) => of(new PaymentOptionsSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new AccountFailure(err.error))),
      )),
  ));

  findAllTransaction$ = createEffect(() => this.actions.pipe(
    ofType(AccountActionTypes.getTransactionsByAccountId),
    switchMap((action: GetTransactionsByAccountId) =>
      this.accountService.getTransactionsByAccountId(action.id, action.page, action.sort, action.direction,
        action.size).pipe(
        switchMap((transactions: ITransaction[]) => of(new AccountSuccess(transactions))),
        catchError((err: HttpErrorResponse) => of(new AccountFailure(err.error))),
      )),
  ));

  findByCustomer$ = createEffect(() => this.actions.pipe(
    ofType(AccountActionTypes.getAccountByCustomerId),
    switchMap((action: GetAccountByCustomerId) =>
      this.accountService.getAccountByCustomerId(action.customerId).pipe(
        switchMap((account?: IAccount) => of(new AccountSelected(account))),
        catchError((err: HttpErrorResponse) => of(new AccountFailure(err.error))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(AccountActionTypes.createTransaction),
    switchMap((action: CreateTransaction) =>
      this.accountService.createTransaction(action.id, action.transaction).pipe(
        switchMap((response: IApiResponse) => {
          if (response.paymentLink) {
            return of(new PaymentSend(response.paymentLink));
          } else {
            const message = this.translate.instant('ACCOUNT.MONEY_ADDED', { id: action.id });
            const path = `accounts/${ action.id }/transactions/${ response.id }`;
            return success(AccountSaveSuccess, message, path);
          }
        }),
        catchError((err: HttpErrorResponse) => of(new AccountFailure(err.error))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(AccountActionTypes.updateAccount),
    switchMap((action: UpdateAccount) =>
      this.accountService.updateAccount(action.id, action.transaction).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('ACCOUNT.UPDATED', { id: response.id });
          return success(AccountSaveSuccess, message, `accounts/customers/${ action.customerId }`);
        }),
        catchError((err: HttpErrorResponse) => of(new AccountFailure(err.error))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(AccountActionTypes.accountSelected),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(AccountActionTypes.accountSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(AccountActionTypes.accountSaveSuccess),
  ), { dispatch: false });

  send$ = createEffect(() => this.actions.pipe(
    ofType(AccountActionTypes.paymentSend),
    tap((data: PaymentSend) => window.open(data.link, '_self')),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions,
              private accountService: AccountService, private paymentService: PaymentService) {
  }
}
