import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanUser, setCurrentUserId, setUserNavigationParams } from '../store/user.actions';
import { Router } from '@angular/router';

@Injectable()
export class UserNavigationEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly router: Router = inject(Router);

  handleUserNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;
        const navigation = this.router.getCurrentNavigation();
        const navigationState = navigation?.extras.state;

        // 1) /users/add
        const addMatch = url.match(/\/users\/add$/);
        if (addMatch) {
          if (navigationState) {
            return [cleanUser(), setUserNavigationParams({ role: navigationState['role'] })];
          }
          return [cleanUser()];
        }

        // 2) /users/:id/overview
        const overviewMatch = url.match(/\/users\/([^\/]+)\/overview$/);
        if (overviewMatch) {
          return [
            cleanUser(),
            setCurrentUserId({ userId: overviewMatch[1] }),
          ];
        }

        // 3) /users/:id
        const detailMatch = url.match(/\/users\/([^\/]+)$/);
        if (detailMatch) {
          return [
            cleanUser(),
            setCurrentUserId({ userId: detailMatch[1] }),
          ];
        }

        // 4) /users
        const viewMatch = url.match(/\/users\/?$/);
        if (viewMatch) {
          return [cleanUser()];
        }

        return [];
      }),
    ));
}
