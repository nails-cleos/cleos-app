import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IApiResponse } from '../interfaces/common';
import { INote, INoteAll } from '../note/note';
import { IUserAll } from '../user/user';
import { NoteService } from '../services/note.service';
import { UserService } from '../services/user.service';
import { createStoreInitialState, mapCrudHttpError, StoreState } from './crud-signal-store';

type NoteNavigationParams = {
  professional?: IUserAll;
  date?: Date;
};

type NoteStoreState = StoreState<INote, INoteAll> & {
  professionals: IUserAll[] | undefined;
  navigationParams: NoteNavigationParams | undefined;
};

const initialState: NoteStoreState = {
  ...createStoreInitialState<INote, INoteAll>(),
  professionals: undefined,
  navigationParams: undefined,
};

export const NoteStore = signalStore(
  withState(initialState),
  withMethods((store, noteService = inject(NoteService), userService = inject(UserService),
    translate = inject(TranslateService)) => {
    const patchError = (err: any): void => {
      const error = mapCrudHttpError(err);
      patchState(store, {
        error,
        subErrors: error.subErrors,
        response: undefined,
        isLoading: false,
      });
    };

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

      loadProfessionals(): void {
        patchState(store, {
          professionals: undefined,
          subErrors: undefined,
          response: undefined,
          isLoading: true,
          error: undefined,
        });

        userService.getProfessionals().subscribe({
          next: (professionals) => patchState(store, {
            professionals,
            isLoading: false,
          }),
          error: patchError,
        });
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
