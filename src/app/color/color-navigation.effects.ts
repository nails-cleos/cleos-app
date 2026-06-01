import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { cleanColor } from '../store/color.actions';
import { navigation } from '../store/router-navigation.operator';
import { ColorDetailsPageComponent } from './color-details-page.component';
import { ColorListComponent } from './list/color-list.component';
import { ColorCreatePageComponent } from './color-create-page.component';

@Injectable()
export class ColorNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  loadColorListPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(ColorListComponent, {
        run: () => cleanColor(),
      }),
    ));

  loadColorAddPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(ColorCreatePageComponent, {
        run: () => cleanColor(),
      }),
    ));

  loadColorDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(ColorDetailsPageComponent, {
        run: () => cleanColor(),
      }),
    ));
}
