import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED, RouterNavigatedAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanDocument } from '../store/document.actions';
import { getAllMyOffices } from '../store/office.actions';

@Injectable()
export class DocumentNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleDocumentNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      concatMap((action: RouterNavigatedAction) => {
        const url = action.payload.routerState.url;

        // 1) /documents
        const documentsMatch = url.match(/\/documents\/?$/);
        if (documentsMatch) {
          return [cleanDocument(), getAllMyOffices()];
        }

        return [];
      }),
    ));
}
