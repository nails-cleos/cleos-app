import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { cleanNote, getAllProfessional, setNoteNavigationParams } from '../store/actions/note.actions';
import { navigation } from '../util/router-navigation.operator';
import { NoteCreatePageComponent } from './note-create-page.component';
import { NoteDetailsPageComponent } from './note-details-page.component';

@Injectable()
export class NoteNavigationEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly router: Router = inject(Router);

  loadNoteAddPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(NoteCreatePageComponent, {
        run: () => {
          const navigation = this.router.currentNavigation();

          const navigationState = navigation?.extras.state;
          const params = navigationState ? [
            setNoteNavigationParams({ professional: navigationState['professional'], date: navigationState['date'] }),
          ] : [];

          return [cleanNote(), getAllProfessional(), ...params];
        },
      }),
    ));

  loadNoteDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(NoteDetailsPageComponent, {
        run: () => [cleanNote(), getAllProfessional()],
      }),
    ));
}
