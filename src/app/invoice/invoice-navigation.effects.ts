import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { cleanInvoice } from '../store/actions/invoice.actions';
import { getAllMyOffices } from '../store/actions/office.actions';
import { getOptions } from '../store/actions/payment.actions';
import { navigation } from '../util/router-navigation.operator';
import { InvoiceListComponent } from './list/invoice-list.component';

@Injectable()
export class InvoiceNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  loadInvoiceListPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(InvoiceListComponent, {
        run: () => [cleanInvoice(), getOptions(), getAllMyOffices()],
      }),
    ));
}
