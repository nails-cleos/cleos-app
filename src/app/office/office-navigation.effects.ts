import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanOffice, getAllManager, setCurrentOfficeId } from '../store/office.actions';

@Injectable()
export class OfficeNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleOfficeNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;

        // 1) /offices/add
        const addMatch = url.match(/\/offices\/add$/);
        if (addMatch) {
          return [cleanOffice(), getAllManager()];
        }

        // 2) /offices/:id
        const detailMatch = url.match(/\/offices\/([^\/]+)$/);
        if (detailMatch) {
          return [
            cleanOffice(),
            setCurrentOfficeId({ officeId: detailMatch[1] }),
          ];
        }

        // 3) /offices
        const viewMatch = url.match(/\/offices\/?$/);
        if (viewMatch) {
          return [cleanOffice()];
        }

        return [];
      }),
    ));
}
