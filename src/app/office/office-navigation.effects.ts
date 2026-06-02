import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { cleanOffice, getAllManager } from '../store/actions/office.actions';
import { navigation } from '../util/router-navigation.operator';
import { OfficeListComponent } from './list/office-list.component';
import { OfficeCreatePageComponent } from './office-create-page.component';
import { OfficeDetailsPageComponent } from './office-details-page.component';

@Injectable()
export class OfficeNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  loadOfficeListPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(OfficeListComponent, {
        run: () => cleanOffice(),
      }),
    ));

  loadOfficeAddPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(OfficeCreatePageComponent, {
        run: () => [cleanOffice(), getAllManager()],
      }),
    ));

  loadOfficeDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(OfficeDetailsPageComponent, {
        run: () => cleanOffice(),
      }),
    ));
}
