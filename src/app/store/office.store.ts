import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IApiResponse, PageRequest } from '../interfaces/common';
import { IOffice, IOfficeAll } from '../office/office';
import { Pagination } from '../interfaces/pagination';
import { OfficeService } from '../services/office.service';
import {
  cleanCrudCreate,
  cleanCrudDelete,
  cleanCrudUpdate,
  createStoreInitialState,
  patchCrudError,
} from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';
import type { Subscription } from 'rxjs';

export type OfficeData =
  | { kind: 'pagination'; value: Pagination<IOfficeAll> }
  | { kind: 'list'; value: IOfficeAll[] };

const initialState = createStoreInitialState<OfficeData, IOfficeAll>();

export const OfficeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((
    store,
    officeService = inject(OfficeService),
    translateService = inject(TranslateService),
  ) => {
    let loadPageSubscription: Subscription | undefined;
    let loadMyOfficesSubscription: Subscription | undefined;
    let loadByIdSubscription: Subscription | undefined;
    let createSubscription: Subscription | undefined;
    let updateSubscription: Subscription | undefined;
    let deleteSubscription: Subscription | undefined;

    const cancelAll = (): void => {
      loadPageSubscription?.unsubscribe();
      loadMyOfficesSubscription?.unsubscribe();
      loadByIdSubscription?.unsubscribe();
      createSubscription?.unsubscribe();
      updateSubscription?.unsubscribe();
      deleteSubscription?.unsubscribe();
    };
    const patchError = (err: HttpErrorResponse): void => patchCrudError(store, err);

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

      loadPage({ page, sort, direction, size }: PageRequest): void {
        loadPageSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadPageSubscription = officeService.getOfficesPage(page, sort, direction, size).subscribe({
          next: (value) => patchState(store, { data: { kind: 'pagination', value }, isLoading: false }),
          error: patchError,
        });
      },

      loadMyOffices(): void {
        loadMyOfficesSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadMyOfficesSubscription = officeService.getAllMyOffices().subscribe({
          next: (value) => patchState(store, { data: { kind: 'list', value: value }, isLoading: false }),
          error: patchError,
        });
      },

      loadById(id: string): void {
        loadByIdSubscription?.unsubscribe();
        patchState(store, { selected: undefined, isLoading: true });

        loadByIdSubscription = officeService.getOffice(id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      create(office: IOffice): void {
        createSubscription?.unsubscribe();
        cleanCrudCreate(store);

        createSubscription = officeService.createOffice(office).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translateService.instant('OFFICE.CREATED', { name: response.name }),
              path: `offices/${ response.id }`,
              redirect: 'offices',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update(id: string, office: IOffice): void {
        updateSubscription?.unsubscribe();
        cleanCrudUpdate(store);

        updateSubscription = officeService.updateOffice(id, office).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translateService.instant('OFFICE.UPDATED.MESSAGE', { name: response.name }),
              path: `offices/${ response.id }`,
              redirect: 'offices',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete(id: string, name: string): void {
        deleteSubscription?.unsubscribe();
        cleanCrudDelete(store);

        deleteSubscription = officeService.deleteOffice(id).subscribe({
          next: () => patchState(store, {
            response: {
              message: translateService.instant('OFFICE.DELETED.MESSAGE', { name }),
              redirect: 'offices',
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
