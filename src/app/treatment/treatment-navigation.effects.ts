import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED, RouterNavigatedAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanTreatment, getAllColors, getAllTreatmentsGroup, setCurrentTreatmentId } from '../store/treatment.actions';

@Injectable()
export class TreatmentNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleTreatmentNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      concatMap((action: RouterNavigatedAction) => {
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
          return [
            cleanTreatment(),
            getAllColors(),
            setCurrentTreatmentId({ treatmentId: detailMatch[1] }),
          ];
        }

        // 4) /treatments/:id/view
        const viewMatch = url.match(/\/treatments\/([^\/]+)\/view$/);
        if (viewMatch) {
          return [
            cleanTreatment(),
            setCurrentTreatmentId({ treatmentId: viewMatch[1] }),
          ];
        }

        // 5) /treatments/:id/sorting
        const sortingMatch = url.match(/\/treatments\/([^\/]+)\/sorting$/);
        if (sortingMatch) {
          return [
            cleanTreatment(),
            setCurrentTreatmentId({ treatmentId: sortingMatch[1] }),
          ];
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
