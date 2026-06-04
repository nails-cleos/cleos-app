import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { tap } from 'rxjs/operators';
import { NoteCreatePageComponent } from './note-create-page.component';
import { NoteDetailsPageComponent } from './note-details-page.component';
import { NoteStore } from '../store/note.store';
import { AppRouterStateSnapshot } from '../util/router-state.serializer';

@Injectable()
export class NoteNavigationEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly router: Router = inject(Router);
  private readonly noteStore = inject(NoteStore);

  loadNoteAddPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      tap((action: any) => {
        const routerState = action.payload.routerState as AppRouterStateSnapshot;
        if (routerState.activeComponent !== NoteCreatePageComponent) {
          return;
        }
        this.noteStore.clean();
        this.noteStore.loadProfessionals();

        const navigation = this.router.currentNavigation();
        const navigationState = navigation?.extras.state;
        this.noteStore.setNavigationParams(navigationState ? {
          professional: navigationState['professional'],
          date: navigationState['date'],
        } : undefined);
      }),
    ), { dispatch: false });

  loadNoteDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      tap((action: any) => {
        const routerState = action.payload.routerState as AppRouterStateSnapshot;
        if (routerState.activeComponent !== NoteDetailsPageComponent) {
          return;
        }
        this.noteStore.clean();
        this.noteStore.loadProfessionals();
        this.noteStore.setNavigationParams(undefined);
      }),
    ), { dispatch: false });
}
