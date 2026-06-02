import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
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
  paymentSend,
  updateAccount,
} from '../actions/account.actions';
import { TranslateService } from '@ngx-translate/core';
import { AccountService } from '../../services/account.service';
import { IAccountAll, ITransaction } from '../../interfaces/account';
import { IApiResponse, success } from '../../interfaces/common';
import { effectRequest } from '../../util/rxjs';

@Injectable()
export class AccountEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly accountService: AccountService = inject(AccountService);

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getAccount),
    switchMap(({ id }) => effectRequest(
      this.accountService.getAccount(id)
        .pipe(map((selected?: IAccountAll) => accountSelected({ selected }))),
      action => action,
      accountFailure,
    )),
  ));

  findTransaction$ = createEffect(() => this.actions.pipe(
    ofType(getTransaction),
    switchMap(({ id, transactionId }) => effectRequest(
      this.accountService.getTransaction(id, transactionId)
        .pipe(map((selected?: ITransaction) => accountSelected({ selected }))),
      action => action,
      accountFailure,
    )),
  ));

  findAllTransaction$ = createEffect(() => this.actions.pipe(
    ofType(getTransactionsByAccountId),
    switchMap(({ id, page, sort, direction, size }) => effectRequest(
      this.accountService.getTransactionsByAccountId(id, page, sort, direction, size)
        .pipe(map((transactions: ITransaction[]) =>
          accountSuccess({ data: transactions }))),
      action => action,
      accountFailure,
    )),
  ));

  findByCustomer$ = createEffect(() => this.actions.pipe(
    ofType(getAccountByCustomerId),
    switchMap(({ customerId }) => effectRequest(
      this.accountService.getAccountByCustomerId(customerId)
        .pipe(map((selected?: IAccountAll) => accountSelected({ selected }))),
      action => action,
      accountFailure,
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createTransaction),
    switchMap(({ id, transaction }) => effectRequest(
      this.accountService.createTransaction(id, transaction)
        .pipe(switchMap((response: IApiResponse) => {
          if (response.paymentLink) {
            return of(paymentSend({ link: response.paymentLink }));
          } else {
            const message = this.translate.instant('ACCOUNT.MONEY_ADDED', { id: id });
            const path = `accounts/${ id }/transactions/${ response.id }`;
            return success(accountSaveSuccess, message, path);
          }
        })),
      action => action,
      accountFailure,
    )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateAccount),
    switchMap(({ id, transaction, customerId }) => effectRequest(
      this.accountService.updateAccount(id, transaction)
        .pipe(switchMap((response: IApiResponse) => {
          const message = this.translate.instant('ACCOUNT.UPDATED', { id: response.id });
          return success(accountSaveSuccess, message, `accounts/customers/${ customerId }`);
        })),
      action => action,
      accountFailure,
    )),
  ));

  send$ = createEffect(() => this.actions.pipe(
    ofType(paymentSend),
    tap(({ link }) => window.open(link, '_self')),
  ), { dispatch: false });
}
