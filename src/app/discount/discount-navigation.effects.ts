import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanDiscount, getAllCurrency } from '../store/discount.actions';

@Injectable()
export class DiscountNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleDiscountNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;

        // 1) /discounts/add
        const addMatch = url.match(/\/discounts\/add$/);
        if (addMatch) {
          return [cleanDiscount(), getAllCurrency()];
        }

        // 2) /discounts/:id
        const detailMatch = url.match(/\/discounts\/([^\/]+)$/);
        if (detailMatch) {
          return [cleanDiscount()];
        }

        // 3) /discounts
        const viewMatch = url.match(/\/discounts\/?$/);
        if (viewMatch) {
          return [cleanDiscount()];
        }

        return [];
      }),
    ));
}
