import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { navigation } from '../store/router-navigation.operator';
import { CurrencyListComponent } from './list/currency-list.component';
import { cleanCurrency } from '../store/currency.actions';
import { CurrencyCreatePageComponent } from './currency-create-page.component';
import { CurrencyDetailsPageComponent } from './currency-details-page.component';

@Injectable()
export class CurrencyNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  loadCurrencyListPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(CurrencyListComponent, {
        run: () => cleanCurrency(),
      }),
    ));

  loadCurrencyAddPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(CurrencyCreatePageComponent, {
        run: () => cleanCurrency(),
      }),
    ));

  loadCurrencyDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(CurrencyDetailsPageComponent, {
        run: () => cleanCurrency(),
      }),
    ));
}
