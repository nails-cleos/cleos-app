import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanNote, getAllProfessional, setCurrentNoteId, setNoteNavigationParams } from '../store/note.actions';
import { Router } from '@angular/router';

@Injectable()
export class NoteNavigationEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly router: Router = inject(Router);

  handleNoteNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;
        const navigation = this.router.getCurrentNavigation();
        const navigationState = navigation?.extras.state;

        // 1) /notes/add
        const addMatch = url.match(/\/notes\/add$/);
        if (addMatch) {
          if (navigationState &&
            (navigationState['professional'] !== undefined || navigationState['date'] !== undefined)) {
            return [
              cleanNote(),
              getAllProfessional(),
              setNoteNavigationParams({ professional: navigationState['professional'], date: navigationState['date'] }),
            ];
          }
          return [cleanNote(), getAllProfessional()];
        }

        // 2) /notes/:id
        const detailMatch = url.match(/\/notes\/([^\/]+)$/);
        if (detailMatch) {
          return [
            cleanNote(),
            getAllProfessional(),
            setCurrentNoteId({ noteId: detailMatch[1] }),
          ];
        }

        return [];
      }),
    ));
}
