import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { cleanUser, setUserNavigationParams } from '../store/actions/user.actions';
import { navigation } from '../util/router-navigation.operator';
import { OverviewComponent } from './overview/overview.component';
import { UserListComponent } from './list/user-list.component';
import { UserCreatePageComponent } from './user-create-page.component';
import { UserDetailsPageComponent } from './user-details-page.component';

@Injectable()
export class UserNavigationEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly router: Router = inject(Router);

  loadUserCreatePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(UserCreatePageComponent, {
        run: () => {
          const navigationState = this.router.currentNavigation()?.extras.state;
          if (navigationState) {
            return [cleanUser(), setUserNavigationParams({ role: navigationState['role'] })];
          }
          return [cleanUser()];
        },
      }),
    ));

  loadUserOverviewPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(OverviewComponent, {
        run: () => [cleanUser()],
      }),
    ));

  loadUserDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(UserDetailsPageComponent, {
        run: () => [cleanUser()],
      }),
    ));

  loadUserListPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(UserListComponent, {
        run: () => [cleanUser()],
      }),
    ));
}
