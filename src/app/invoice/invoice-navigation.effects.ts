import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanInvoice } from '../store/invoice.actions';
import { getAllMyOffices } from '../store/office.actions';

@Injectable()
export class InvoiceNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleInvoiceNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;

        // 1) /invoices
        const invoicesMatch = url.match(/\/invoices\/?$/);
        if (invoicesMatch) {
          return [cleanInvoice(), getAllMyOffices()];
        }

        return [];
      }),
    ));
}
