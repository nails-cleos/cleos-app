import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanColor, setCurrentColorId } from '../store/color.actions';

@Injectable()
export class ColorNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleColorNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;

        // 1) /colors/add
        const addMatch = url.match(/\/colors\/add$/);
        if (addMatch) {
          return [cleanColor()];
        }

        // 2) /colors/:id
        const detailMatch = url.match(/\/colors\/([^\/]+)$/);
        if (detailMatch) {
          return [
            cleanColor(),
            setCurrentColorId({ colorId: detailMatch[1] }),
          ];
        }

        // 3) /colors
        const viewMatch = url.match(/\/colors\/?$/);
        if (viewMatch) {
          return [cleanColor()];
        }

        return [];
      }),
    ));
}
