import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanCatalogue, getAllCatalogues, getAllTreatmentsGroup, setCurrentCatalogueId } from '../store/catalogue.actions';

@Injectable()
export class CatalogueNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleCatalogueNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;

        // 1) /catalogues/add
        const addMatch = url.match(/\/catalogues\/add$/);
        if (addMatch) {
          return [cleanCatalogue(), getAllTreatmentsGroup()];
        }

        // 2) /catalogues/:id
        const detailMatch = url.match(/\/catalogues\/([^\/]+)$/);
        if (detailMatch) {
          return [
            cleanCatalogue(),
            getAllTreatmentsGroup(),
            setCurrentCatalogueId({ catalogueId: detailMatch[1] }),
          ];
        }

        // 3) /catalogues
        const viewMatch = url.match(/\/catalogues\/?$/);
        if (viewMatch) {
          return [cleanCatalogue(), getAllCatalogues()];
        }

        return [];
      }),
    ));
}
