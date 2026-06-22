import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
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

const initialState = createStoreInitialState<INote, INoteAll>();

export const NoteStore = signalStore(
  withState(initialState),
  withMethods((
    store,
    noteService = inject(NoteService),
    translate = inject(TranslateService),
  ) => {
    const patchError = (err: HttpErrorResponse): void => patchCrudError(store, err);

    return {
      clean(): void {
        patchState(store, initialState);
      },

      clearResponse(): void {
        patchState(store, { response: undefined });
      },

      clearError(): void {
        patchState(store, { error: undefined, subErrors: undefined });
      },

      loadById(id: string): void {
        patchState(store, { selected: undefined, isLoading: true });

        noteService.getNote(id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      create(note: INote): void {
        cleanCrudCreate(store);

        noteService.createNote(note).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('NOTE.CREATED.MESSAGE', { description: response.name }),
              path: `notes/${ response.id }`,
              redirect: 'reservation/calendar',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update(id: string, note: INote): void {
        cleanCrudUpdate(store);

        noteService.updateNote(id, note).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('NOTE.UPDATED.MESSAGE', { description: response.name }),
              path: `notes/${ response.id }`,
              redirect: 'reservation/calendar',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete(id: string, description: string): void {
        cleanCrudDelete(store);

        noteService.deleteNote(id).subscribe({
          next: () => patchState(store, {
            response: {
              message: translate.instant('NOTE.UPDATED.MESSAGE', { description }),
              toastType: 'warning',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      complete(id: string): void {
        cleanCrudUpdate(store);

        noteService.completeNote(id).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('NOTE.COMPLETED.MESSAGE', { description: response.name }),
              path: `notes/${ response.id }`,
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
