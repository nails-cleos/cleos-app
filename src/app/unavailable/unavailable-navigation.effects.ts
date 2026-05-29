import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import {
  cleanUnavailable,
  getAllProfessional,
  setUnavailableParams,
} from '../store/unavailable.actions';
import { Router } from '@angular/router';

@Injectable()
export class UnavailableNavigationEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly router: Router = inject(Router);

  handleUnavailableNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;
        const navigation = this.router.currentNavigation();
        const navigationState = navigation?.extras.state;

        // 1) /unavailable/block-agenda/add
        const addBlockAgendaMatch = url.match(/\/unavailable\/block-agenda\/add$/);
        if (addBlockAgendaMatch) {
          if (navigationState) {
            return [
              cleanUnavailable(),
              getAllProfessional(),
              setUnavailableParams({ date: navigationState['date'], room: navigationState['room'] }),
            ];
          }
          return [cleanUnavailable(), getAllProfessional()];
        }

        // 2) /unavailable/block-agenda/:id
        const blockAgendaDetailMatch = url.match(/\/unavailable\/block-agenda\/([^\/]+)$/);
        if (blockAgendaDetailMatch) {
          return [cleanUnavailable(), getAllProfessional()];
        }

        // 3) /unavailable/add
        const addMatch = url.match(/\/unavailable\/add$/);
        if (addMatch) {
          return [cleanUnavailable(), getAllProfessional()];
        }

        // 4) /unavailable/:id
        const detailMatch = url.match(/\/unavailable\/([^\/]+)$/);
        if (detailMatch) {
          return [cleanUnavailable(), getAllProfessional()];
        }

        // 5) /unavailable
        const allMatch = url.match(/\/unavailable\/?$/);
        if (allMatch) {
          return [cleanUnavailable()];
        }

        return [];
      }),
    ));
}
