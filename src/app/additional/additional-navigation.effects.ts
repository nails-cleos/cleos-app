import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import {
  cleanAdditional,
  getAdditionalList,
  getAllTreatmentsGroup,
} from '../store/additional.actions';

@Injectable()
export class AdditionalNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleAdditionalNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;

        // 1) /additional/sorting
        const sortingMatch = url.match(/\/additional\/sorting$/);
        if (sortingMatch) {
          return [cleanAdditional(), getAdditionalList()];
        }

        // 2) /additional/add
        const addMatch = url.match(/\/additional\/add$/);
        if (addMatch) {
          return [cleanAdditional(), getAllTreatmentsGroup()];
        }

        // 3) /additional/:id
        const detailMatch = url.match(/\/additional\/([^\/]+)$/);
        if (detailMatch) {
          return [cleanAdditional(), getAllTreatmentsGroup()];
        }

        // 4) /additional
        const viewMatch = url.match(/\/additional\/?$/);
        if (viewMatch) {
          return [cleanAdditional()];
        }

        return [];
      }),
    ));
}
