import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { cleanAdditional, getAdditionalList, getAllTreatmentsGroup } from '../store/actions/additional.actions';
import { navigation } from '../util/router-navigation.operator';
import { AdditionalListComponent } from './list/additional-list.component';
import { AdditionalCreatePageComponent } from './additional-create-page.component';
import { AdditionalDetailsPageComponent } from './additional-details-page.component';
import { AdditionalSortingComponent } from './sorting/additional-sorting.component';

@Injectable()
export class AdditionalNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  loadAdditionalListPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(AdditionalListComponent, {
        run: () => cleanAdditional(),
      }),
    ));

  loadAdditionalAddPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(AdditionalCreatePageComponent, {
        run: () => [cleanAdditional(), getAllTreatmentsGroup()],
      }),
    ));

  loadAdditionalDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(AdditionalDetailsPageComponent, {
        run: () => [cleanAdditional(), getAllTreatmentsGroup()],
      }),
    ));

  loadAdditionalSortingPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(AdditionalSortingComponent, {
        run: () => [cleanAdditional(), getAdditionalList()],
      }),
    ));
}
