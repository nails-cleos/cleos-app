import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { cleanTreatment, getAllColors, getAllTreatmentsGroup } from '../store/actions/treatment.actions';
import { navigation } from '../util/router-navigation.operator';
import { TreatmentListComponent } from './list/treatment-list.component';
import { TreatmentGroupSortingComponent } from './sorting/treatment-group-sorting.component';
import { TreatmentSortingComponent } from './sorting/treatment-sorting.component';
import { TreatmentCreatePageComponent } from './treatment-create-page.component';
import { TreatmentEditPageComponent } from './treatment-edit-page.component';
import { TreatmentViewPageComponent } from './treatment-view-page.component';

@Injectable()
export class TreatmentNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  loadTreatmentListPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(TreatmentListComponent, {
        run: () => [cleanTreatment()],
      }),
    ));

  loadTreatmentGroupSortingPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(TreatmentGroupSortingComponent, {
        run: () => [cleanTreatment(), getAllTreatmentsGroup()],
      }),
    ));

  loadTreatmentCreatePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(TreatmentCreatePageComponent, {
        run: () => [cleanTreatment(), getAllColors()],
      }),
    ));

  loadTreatmentEditPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(TreatmentEditPageComponent, {
        run: () => [cleanTreatment(), getAllColors()],
      }),
    ));

  loadTreatmentViewPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(TreatmentViewPageComponent, {
        run: () => [cleanTreatment()],
      }),
    ));

  loadTreatmentSortingPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(TreatmentSortingComponent, {
        run: () => [cleanTreatment()],
      }),
    ));
}
