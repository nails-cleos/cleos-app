import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { cleanDocument } from '../store/document.actions';
import { getAllMyOffices } from '../store/office.actions';
import { navigation } from '../store/router-navigation.operator';
import { DocumentListComponent } from './list/document-list.component';

@Injectable()
export class DocumentNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  loadDocumentListPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(DocumentListComponent, {
        run: () => [cleanDocument(), getAllMyOffices()],
      }),
    ));
}
