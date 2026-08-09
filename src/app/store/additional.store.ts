import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IAdditional, IAdditionalAll } from '../additional/additional';
import { IApiResponse, PageRequest } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';
import { AdditionalService } from '../services/additional.service';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import {
  cleanCrudCreate,
  cleanCrudDelete,
  cleanCrudUpdate,
  createStoreInitialState,
  patchCrudError,
} from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';
import type { Subscription } from 'rxjs';

export type AdditionalData =
  | { kind: 'pagination'; value?: Pagination<IAdditionalAll> }
  | { kind: 'list'; value?: IAdditionalAll[] };

const initialState = createStoreInitialState<AdditionalData, IAdditionalAll>();

export const AdditionalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      additionalService = inject(AdditionalService),
      translateService = inject(TranslateService),
    ) => {
      let loadPageSubscription: Subscription | undefined;
      let loadListSubscription: Subscription | undefined;
      let loadAllByGroupIdSubscription: Subscription | undefined;
      let loadByIdSubscription: Subscription | undefined;
      let createSubscription: Subscription | undefined;
      let updateSubscription: Subscription | undefined;
      let sortSubscription: Subscription | undefined;
      let deleteSubscription: Subscription | undefined;

      const cancelAll = (): void => {
        loadPageSubscription?.unsubscribe();
        loadListSubscription?.unsubscribe();
        loadAllByGroupIdSubscription?.unsubscribe();
        loadByIdSubscription?.unsubscribe();
        createSubscription?.unsubscribe();
        updateSubscription?.unsubscribe();
        sortSubscription?.unsubscribe();
        deleteSubscription?.unsubscribe();
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

        loadPage({ sort, direction, page, size }: PageRequest): void {
          loadPageSubscription?.unsubscribe();
          patchState(store, { data: undefined, isLoading: true });

          loadPageSubscription = additionalService
            .getAdditionalPage(sort, direction, page, size)
            .subscribe({
              next: (value) =>
                patchState(store, {
                  data: { kind: 'pagination', value },
                  isLoading: false,
                }),
              error: patchError,
            });
        },

        loadList(): void {
          loadListSubscription?.unsubscribe();
          patchState(store, {
            data: { kind: 'list', value: [] },
            isLoading: true,
          });

          loadListSubscription = additionalService
            .getAdditionalList()
            .subscribe({
              next: (value) =>
                patchState(store, {
                  data: { kind: 'list', value },
                  isLoading: false,
                }),
              error: patchError,
            });
        },

        loadAllByGroupId(roomId: string, groupId: string): void {
          loadAllByGroupIdSubscription?.unsubscribe();
          patchState(store, {
            data: { kind: 'list', value: [] },
            isLoading: true,
          });

          loadAllByGroupIdSubscription = additionalService
            .getAllAdditionalByGroupId(roomId, groupId)
            .subscribe({
              next: (value) =>
                patchState(store, {
                  data: { kind: 'list', value },
                  isLoading: false,
                }),
              error: patchError,
            });
        },

        loadById(id: string): void {
          loadByIdSubscription?.unsubscribe();
          patchState(store, { selected: undefined, isLoading: true });

          loadByIdSubscription = additionalService.getAdditional(id).subscribe({
            next: (selected) =>
              patchState(store, { selected, isLoading: false }),
            error: patchError,
          });
        },

        create(additional: IAdditional): void {
          createSubscription?.unsubscribe();
          cleanCrudCreate(store);

          createSubscription = additionalService
            .createAdditional(additional)
            .subscribe({
              next: (response: IApiResponse) =>
                patchState(store, {
                  response: {
                    message: translateService.instant('ADDITIONAL.CREATED', {
                      name: response.name,
                    }),
                    path: `additional/${response.id}`,
                    redirect: 'additional',
                  },
                  isLoading: false,
                }),
              error: patchError,
            });
        },

        update(id: string, additional: IAdditional): void {
          updateSubscription?.unsubscribe();
          cleanCrudUpdate(store);

          updateSubscription = additionalService
            .updateAdditional(id, additional)
            .subscribe({
              next: (response: IAdditional) =>
                patchState(store, {
                  response: {
                    message: translateService.instant(
                      'ADDITIONAL.UPDATED.MESSAGE',
                      { name: response.name },
                    ),
                    path: `additional/${response.id}`,
                    redirect: 'additional',
                  },
                  isLoading: false,
                }),
              error: patchError,
            });
        },

        sort(additionalList: ISorted[]): void {
          sortSubscription?.unsubscribe();
          patchState(store, {
            data: undefined,
            response: undefined,
            isLoading: true,
          });

          sortSubscription = additionalService
            .sortAdditional(additionalList)
            .subscribe({
              next: () =>
                patchState(store, {
                  response: { message: 'ADDITIONAL.SORTED.MESSAGE' },
                  isLoading: false,
                }),
              error: patchError,
            });
        },

        delete(id: string, name: string): void {
          deleteSubscription?.unsubscribe();
          cleanCrudDelete(store);

          deleteSubscription = additionalService
            .deleteAdditional(id)
            .subscribe({
              next: () =>
                patchState(store, {
                  response: {
                    message: translateService.instant(
                      'ADDITIONAL.DELETED.MESSAGE',
                      { name },
                    ),
                    reload: true,
                    toastType: 'warning',
                  },
                  isLoading: false,
                }),
              error: patchError,
            });
        },
      };
    },
  ),
);
