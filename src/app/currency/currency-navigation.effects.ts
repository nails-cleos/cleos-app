import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { clean, setCurrentCurrencyId } from '../store/currency.actions';

@Injectable()
export class CurrencyNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleCurrencyNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;

        // 1) /currency/add
        const addMatch = url.match(/\/currency\/add$/);
        if (addMatch) {
          return [clean()];
        }

        // 2) /currency/:id
        const detailMatch = url.match(/\/currency\/([^\/]+)$/);
        if (detailMatch) {
          return [
            clean(),
            setCurrentCurrencyId({ currencyId: detailMatch[1] }),
          ];
        }

        // 3) /currency
        const viewMatch = url.match(/\/currency\/?$/);
        if (viewMatch) {
          return [clean()];
        }

        return [];
      }),
    ));
}
