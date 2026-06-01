import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { navigation } from '../store/router-navigation.operator';
import { DiscountListComponent } from './list/discount-list.component';
import { cleanDiscount, getAllCurrency } from '../store/discount.actions';
import { DiscountCreatePageComponent } from './discount-create-page.component';
import { DiscountDetailsPageComponent } from './discount-details-page.component';

@Injectable()
export class DiscountNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  loadDiscountListPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(DiscountListComponent, {
        run: () => cleanDiscount(),
      }),
    ));

  loadDiscountAddPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(DiscountCreatePageComponent, {
        run: () => [cleanDiscount(), getAllCurrency()],
      }),
    ));

  loadDiscountDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(DiscountDetailsPageComponent, {
        run: () => cleanDiscount(),
      }),
    ));
}
