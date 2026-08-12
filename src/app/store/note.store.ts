import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { IApiResponse } from '../interfaces/common';
import { INote, INoteAll } from '../note/note';
import { NoteService } from '../services/note.service';
import {
  cleanCrudCreate,
  cleanCrudDelete,
  cleanCrudUpdate,
  createStoreInitialState,
  patchCrudError,
} from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';
import type { Subscription } from 'rxjs';

const initialState = createStoreInitialState<INote, INoteAll>();

export const NoteStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, noteService = inject(NoteService)) => {
    let loadByIdSubscription: Subscription | undefined;
    let createSubscription: Subscription | undefined;
    let updateSubscription: Subscription | undefined;
    let deleteSubscription: Subscription | undefined;
    let completeSubscription: Subscription | undefined;

    const cancelAll = (): void => {
      loadByIdSubscription?.unsubscribe();
      createSubscription?.unsubscribe();
      updateSubscription?.unsubscribe();
      deleteSubscription?.unsubscribe();
      completeSubscription?.unsubscribe();
    };
    const patchError = (err: HttpErrorResponse): void =>
      patchCrudError(store, err);

    return {
      clean(): void {
        cancelAll();
        patchState(store, initialState);
      },

      clearResponse(): void {
        patchState(store, { response: undefined });
      },

      clearError(): void {
        patchState(store, { error: undefined, subErrors: undefined });
      },

      loadById(id: string): void {
        loadByIdSubscription?.unsubscribe();
        patchState(store, { selected: undefined, isLoading: true });

        loadByIdSubscription = noteService.getNote(id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      create(note: INote): void {
        createSubscription?.unsubscribe();
        cleanCrudCreate(store);

        createSubscription = noteService.createNote(note).subscribe({
          next: (response: IApiResponse) =>
            patchState(store, {
              response: {
                messageKey: 'NOTE.CREATED.MESSAGE',
                messageParams: {
                  description: response.name,
                },
                path: `notes/${response.id}`,
                redirect: 'reservation/calendar',
              },
              isLoading: false,
            }),
          error: patchError,
        });
      },

      update(id: string, note: INote): void {
        updateSubscription?.unsubscribe();
        cleanCrudUpdate(store);

        updateSubscription = noteService.updateNote(id, note).subscribe({
          next: (response: IApiResponse) =>
            patchState(store, {
              response: {
                messageKey: 'NOTE.UPDATED.MESSAGE',
                messageParams: {
                  description: response.name,
                },
                path: `notes/${response.id}`,
                redirect: 'reservation/calendar',
              },
              isLoading: false,
            }),
          error: patchError,
        });
      },

      delete(id: string, description: string): void {
        deleteSubscription?.unsubscribe();
        cleanCrudDelete(store);

        deleteSubscription = noteService.deleteNote(id).subscribe({
          next: () =>
            patchState(store, {
              response: {
                messageKey: 'NOTE.DELETED.MESSAGE',
                messageParams: {
                  description,
                },
                toastType: 'warning',
              },
              isLoading: false,
            }),
          error: patchError,
        });
      },

      complete(id: string): void {
        completeSubscription?.unsubscribe();
        cleanCrudUpdate(store);

        completeSubscription = noteService.completeNote(id).subscribe({
          next: (response: IApiResponse) =>
            patchState(store, {
              response: {
                messageKey: 'NOTE.COMPLETED.MESSAGE',
                messageParams: {
                  description: response.name,
                },
                path: `notes/${response.id}`,
                redirect: 'reservation/calendar',
              },
              isLoading: false,
            }),
          error: patchError,
        });
      },
    };
  }),
);
