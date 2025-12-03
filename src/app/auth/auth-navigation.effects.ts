import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED, RouterNavigatedAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanUser, getMyUser } from '../store/user.actions';
import * as authActions from '../store/auth.actions';

@Injectable()
export class AuthNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleAuthNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      concatMap((action: RouterNavigatedAction) => {
        const url = action.payload.routerState.url;

        // 1) /auth/forgot-password
        if (url.match(/\/auth\/forgot-password$/)) {
          return [authActions.clean()];
        }

        // 2) /auth/profile
        if (url.match(/\/auth\/profile$/)) {
          return [cleanUser(), getMyUser()];
        }

        // 3) /auth/redirect
        if (url.match(/\/auth\/redirect$/)) {
          return [];
        }

        // 4) /auth
        if (url.match(/\/auth\/?$/)) {
          const queryParams = action.payload.routerState.root.queryParams;
          const code = queryParams?.['code'] || undefined;

          return [authActions.clean(), authActions.setCurrentCode({ code })];
        }

        return [];
      }),
    ),
  );
}
