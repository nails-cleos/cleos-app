import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED, RouterNavigatedAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { clean, getAllMyOffices } from '../store/invoice.actions';

@Injectable()
export class InvoiceNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleInvoiceNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      concatMap((action: RouterNavigatedAction) => {
        const url = action.payload.routerState.url;

        // 1) /invoices
        const invoicesMatch = url.match(/\/invoices\/?$/);
        if (invoicesMatch) {
          return [clean(), getAllMyOffices()];
        }

        return [];
      }),
    ));
}
