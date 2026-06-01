import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import {
  cleanUnavailable,
  getAllProfessional,
  setUnavailableParams,
} from '../store/unavailable.actions';
import { navigation } from '../store/router-navigation.operator';
import { BlockAgendaCreatePageComponent } from './block-agenda/block-agenda-create-page.component';
import { BlockAgendaDetailsPageComponent } from './block-agenda/block-agenda-details-page.component';
import { UnavailableListComponent } from './list/unavailable-list.component';
import { UnavailableCreatePageComponent } from './unavailable-create-page.component';
import { UnavailableDetailsPageComponent } from './unavailable-details-page.component';

@Injectable()
export class UnavailableNavigationEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly router: Router = inject(Router);

  loadBlockAgendaCreatePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(BlockAgendaCreatePageComponent, {
        run: () => {
          const navigationState = this.router.currentNavigation()?.extras.state;
          if (navigationState) {
            return [
              cleanUnavailable(),
              getAllProfessional(),
              setUnavailableParams({ date: navigationState['date'], room: navigationState['room'] }),
            ];
          }
          return [cleanUnavailable(), getAllProfessional()];
        },
      }),
    ));

  loadBlockAgendaDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(BlockAgendaDetailsPageComponent, {
        run: () => [cleanUnavailable(), getAllProfessional()],
      }),
    ));

  loadUnavailableCreatePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(UnavailableCreatePageComponent, {
        run: () => [cleanUnavailable(), getAllProfessional()],
      }),
    ));

  loadUnavailableDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(UnavailableDetailsPageComponent, {
        run: () => [cleanUnavailable(), getAllProfessional()],
      }),
    ));

  loadUnavailableListPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(UnavailableListComponent, {
        run: () => [cleanUnavailable()],
      }),
    ));
}
