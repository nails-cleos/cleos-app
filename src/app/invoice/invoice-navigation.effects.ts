import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { cleanInvoice } from '../store/invoice.actions';
import { getAllMyOffices } from '../store/office.actions';
import { getOptions } from '../store/payment.actions';
import { navigation } from '../store/router-navigation.operator';
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
