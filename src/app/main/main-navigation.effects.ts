import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanMain, setCurrentLang, setCurrentTreatmentId } from '../store/main.actions';
import { cleanCatalogue, getAllCatalogs } from '../store/catalogue.actions';

@Injectable()
export class MainNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleMainNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;
        const cleanUrl = url.split('?')[0].split('#')[0];
        const homeMatch = cleanUrl.match(/^\/([^\/]+)\/home(?:\/(.*))?$/);
        if (!homeMatch) {
          return [];
        }

        const lang = homeMatch[1];
        const homePath = homeMatch[2] || '';

        // 1) /{lang}/home/catalogs
        if (homePath === 'catalogs') {
          return [setCurrentLang({ lang }), cleanCatalogue(), getAllCatalogs()];
        }

        // 2) /{lang}/home/{id}/treatment
        const treatmentMatch = homePath.match(/^([^\/]+)\/treatment$/);
        if (treatmentMatch) {
          return [
            setCurrentLang({ lang }),
            setCurrentTreatmentId({ treatmentId: treatmentMatch[1] }),
          ];
        }

        // 3) /{lang}/home
        if (!homePath) {
          return [cleanMain(), setCurrentLang({ lang })];
        }

        // 4) /{lang}/home/*
        return [setCurrentLang({ lang })];
      }),
    ));
}
