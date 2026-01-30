import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import {
  clean,
  setCurrentAccountId,
  setCurrentCustomerId,
  setCurrentTransactionId,
} from '../store/account.actions';

@Injectable()
export class AccountNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleAccountNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;

        // 1) /accounts/:id/transactions/view
        const viewMatch = url.match(/\/accounts\/([^\/]+)\/transactions\/view$/);
        if (viewMatch) {
          return [clean(), setCurrentAccountId({ accountId: viewMatch[1] })];
        }

        // 2) /accounts/:id/transactions/add
        const addMatch = url.match(/\/accounts\/([^\/]+)\/transactions\/add$/);
        if (addMatch) {
          return [clean(), setCurrentAccountId({ accountId: addMatch[1] })];
        }

        // 3) /accounts/:id/transactions/:transactionId
        const detailMatch = url.match(/\/accounts\/([^\/]+)\/transactions\/([^\/]+)$/);
        if (detailMatch) {
          return [
            clean(),
            setCurrentAccountId({ accountId: detailMatch[1] }),
            setCurrentTransactionId({ transactionId: detailMatch[2] }),
          ];
        }

        // 4) /accounts/customers/:customerId
        const customerMatch = url.match(/\/accounts\/customers\/([^\/]+)$/);
        if (customerMatch) {
          return [clean(), setCurrentCustomerId({ customerId: customerMatch[1] })];
        }

        return [];
      }),
    ));
}
