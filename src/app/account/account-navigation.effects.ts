import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { clean } from '../store/account.actions';
import { getOptions } from '../store/payment.actions';
import { navigation } from '../store/router-navigation.operator';
import { AccountComponent } from './account/account.component';
import { TransactionComponent } from './transaction/transaction.component';
import { TransactionViewComponent } from './transaction/view/transaction-view.component';
import { TransactionDetailComponent } from './transaction/detail/transaction-detail.component';

@Injectable()
export class AccountNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  loadCustomerAccountPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(AccountComponent, {
        run: () => [clean()],
      }),
    ));

  loadTransactionAddPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(TransactionComponent, {
        run: () => [clean(), getOptions()],
      }),
    ));

  loadTransactionViewPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(TransactionViewComponent, {
        run: () => [clean()],
      }),
    ));

  loadTransactionDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(TransactionDetailComponent, {
        run: () => [clean()],
      }),
    ));
}
