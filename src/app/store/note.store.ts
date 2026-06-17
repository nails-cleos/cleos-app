import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IApiResponse } from '../interfaces/common';
import { INote, INoteAll } from '../note/note';
import { IUserAll } from '../user/user';
import { NoteService } from '../services/note.service';
import { createStoreInitialState, patchCrudError, StoreState } from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';

type NoteNavigationParams = {
  professional?: IUserAll;
  date?: Date;
};

type NoteStoreState = StoreState<INote, INoteAll> & {
  navigationParams: NoteNavigationParams | undefined;
};

const initialState: NoteStoreState = {
  ...createStoreInitialState<INote, INoteAll>(),
  navigationParams: undefined,
};

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

      setNavigationParams(params: NoteNavigationParams | undefined): void {
        patchState(store, { navigationParams: params });
      },

      loadById(id: string): void {
        patchState(store, {
          selected: undefined,
          subErrors: undefined,
          response: undefined,
          isLoading: true,
          error: undefined,
        });

        noteService.getNote(id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      create(note: INote): void {
        patchState(store, {
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        noteService.createNote(note).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('NOTE.CREATED.MESSAGE', { description: response.name }),
              path: `notes/${ response.id }`,
              redirect: 'reservation/calendar',
            },
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update(id: string, note: INote): void {
        patchState(store, {
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        noteService.updateNote(id, note).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('NOTE.UPDATED.MESSAGE', { description: response.name }),
              path: `notes/${ response.id }`,
              redirect: 'reservation/calendar',
            },
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete(id: string, description: string): void {
        patchState(store, {
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        noteService.deleteNote(id).subscribe({
          next: () => patchState(store, {
            response: {
              message: translate.instant('NOTE.UPDATED.MESSAGE', { description }),
              toastType: 'warning',
            },
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      complete(id: string): void {
        patchState(store, {
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        noteService.completeNote(id).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('NOTE.COMPLETED.MESSAGE', { description: response.name }),
              path: `notes/${ response.id }`,
              redirect: 'reservation/calendar',
            },
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },
    };
  }),
);
