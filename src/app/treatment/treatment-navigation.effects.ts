import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanTreatment, getAllColors, getAllTreatmentsGroup } from '../store/treatment.actions';

@Injectable()
export class TreatmentNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleTreatmentNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;

        // 1) /treatments/sorting
        const groupSortingMatch = url.match(/\/treatments\/sorting$/);
        if (groupSortingMatch) {
          return [cleanTreatment(), getAllTreatmentsGroup()];
        }

        // 2) /treatments/add
        const addMatch = url.match(/\/treatments\/add$/);
        if (addMatch) {
          return [cleanTreatment(), getAllColors()];
        }

        // 3) /treatments/:id/edit
        const detailMatch = url.match(/\/treatments\/([^\/]+)\/edit$/);
        if (detailMatch) {
          return [cleanTreatment(), getAllColors()];
        }

        // 4) /treatments/:id/view
        const viewMatch = url.match(/\/treatments\/([^\/]+)\/view$/);
        if (viewMatch) {
          return [cleanTreatment()];
        }

        // 5) /treatments/:id/sorting
        const sortingMatch = url.match(/\/treatments\/([^\/]+)\/sorting$/);
        if (sortingMatch) {
          return [cleanTreatment()];
        }

        // 6) /treatments
        const allMatch = url.match(/\/treatments\/?$/);
        if (allMatch) {
          return [cleanTreatment()];
        }

        return [];
      }),
    ));
}
