import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED, RouterNavigatedAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanMain, setCurrentLang, setCurrentTreatmentId } from '../store/main.actions';
import { cleanCatalogue, getAllCatalogs } from '../store/catalogue.actions';

@Injectable()
export class MainNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleMainNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      concatMap((action: RouterNavigatedAction) => {
        const url = action.payload.routerState.url;

        // 1) /home/catalogs
        const catalogsMatch = url.match(/\/home\/catalogs$/);
        if (catalogsMatch) {
          return [cleanCatalogue(), getAllCatalogs()];
        }

        // 1) /home/{id}/treatment
        const treatmentMatch = url.match(/\/home\/([^\/]+)\/treatment$/);
        if (treatmentMatch) {
          return [setCurrentTreatmentId({ treatmentId: treatmentMatch[1] })];
        }

        // 1) /home
        const homeMatch = url.match(/\/([^\/]+)\/home\/?$/);
        if (homeMatch) {
          return [cleanMain(), setCurrentLang({ lang: homeMatch[1] })];
        }

        return [];
      }),
    ));
}
