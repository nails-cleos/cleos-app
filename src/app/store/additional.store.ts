import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IAdditional, IAdditionalAll } from '../additional/additional';
import { IApiResponse, PageRequest } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';
import { AdditionalService } from '../services/additional.service';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { createStoreInitialState, patchCrudError } from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';

export type AdditionalData =
  | { kind: 'pagination'; value?: Pagination<IAdditionalAll> }
  | { kind: 'list'; value?: IAdditionalAll[] };

const initialState = createStoreInitialState<AdditionalData, IAdditionalAll>();

export const AdditionalStore = signalStore(
  withState(initialState),
  withMethods((
    store,
    additionalService = inject(AdditionalService),
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

      loadPage({ sort, direction, page, size }: PageRequest): void {
        patchState(store, {
          data: undefined,
          subErrors: undefined,
          selected: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        additionalService.getAdditionalPage(sort, direction, page, size).subscribe({
          next: (value) => patchState(store, {
            data: { kind: 'pagination', value },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadList(): void {
        patchState(store, {
          data: { kind: 'list', value: [] },
          isLoading: true,
          subErrors: undefined,
          response: undefined,
        });

        additionalService.getAdditionalList().subscribe({
          next: (value) => patchState(store, {
            data: { kind: 'list', value },
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
        });

        additionalService.getAdditional(id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      create(additional: IAdditional): void {
        patchState(store, {
          subErrors: undefined,
          response: undefined,
          isLoading: true,
          selected: undefined,
          data: undefined,
        });

        additionalService.createAdditional(additional).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('ADDITIONAL.CREATED', { name: response.name }),
              path: `additional/${ response.id }`,
              redirect: 'additional',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update(id: string, additional: IAdditional): void {
        patchState(store, {
          subErrors: undefined,
          response: undefined,
          isLoading: true,
          selected: undefined,
          data: undefined,
        });

        additionalService.updateAdditional(id, additional).subscribe({
          next: (response: IAdditional) => patchState(store, {
            response: {
              message: translate.instant('ADDITIONAL.UPDATED.MESSAGE', { name: response.name }),
              path: `additional/${ response.id }`,
              redirect: 'additional',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      sort(additionalList: ISorted[]): void {
        patchState(store, {
          subErrors: undefined,
          response: undefined,
          isLoading: true,
          data: undefined,
        });

        additionalService.sortAdditional(additionalList).subscribe({
          next: () => patchState(store, {
            response: { message: 'ADDITIONAL.SORTED.MESSAGE' },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete(id: string, name: string): void {
        patchState(store, {
          subErrors: undefined,
          response: undefined,
          isLoading: true,
          data: undefined,
        });

        additionalService.deleteAdditional(id).subscribe({
          next: () => patchState(store, {
            response: {
              message: translate.instant('ADDITIONAL.DELETED.MESSAGE', { name }),
              reload: true,
              toastType: 'warning',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },
    };
  }),
);
