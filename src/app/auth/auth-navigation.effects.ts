import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { cleanUser, getMyUser } from '../store/actions/user.actions';
import { cleanAuth, setCurrentCode } from '../store/actions/auth.actions';
import { navigation } from '../util/router-navigation.operator';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ProfileComponent } from './profile/profile.component';
import { Router } from '@angular/router';
import { AuthComponent } from './auth.component';
import { RedirectComponent } from './redirect/redirect.component';

@Injectable()
export class AuthNavigationEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly router: Router = inject(Router);

  loadForgotPasswordPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(ForgotPasswordComponent, {
        run: () => cleanAuth(),
      }),
    ));

  loadProfilePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(ProfileComponent, {
        run: () => [cleanUser(), getMyUser()],
      }),
    ));

  loadAuthPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(AuthComponent, {
        run: (_action, routerState) => {
          const code = routerState.root.queryParams['code'] || undefined;
          return [cleanAuth(), setCurrentCode({ code })];
        },
      }),
    ));

  loadRedirectPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(RedirectComponent, {
        run: () => null,
      }),
    ));
}
