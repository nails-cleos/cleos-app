import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { cleanCatalogue, getAllCatalogues, getAllTreatmentsGroup } from '../store/catalogue.actions';
import { navigation } from '../store/router-navigation.operator';
import { CatalogueListComponent } from './list/catalogue-list.component';
import { CatalogueCreatePageComponent } from './catalogue-create-page.component';
import { CatalogueDetailsPageComponent } from './catalogue-details-page.component';

@Injectable()
export class CatalogueNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  loadCataloguesPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(CatalogueListComponent, {
        run: () => [cleanCatalogue(), getAllCatalogues()],
      }),
    ));

  loadCatalogueAddPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(CatalogueCreatePageComponent, {
        run: () => [cleanCatalogue(), getAllTreatmentsGroup()],
      }),
    ));

  loadCatalogueDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(CatalogueDetailsPageComponent, {
        run: () => [cleanCatalogue(), getAllTreatmentsGroup()],
      }),
    ));
}
