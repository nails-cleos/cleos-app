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

export type OfficeData =
  | { kind: 'pagination'; value: Pagination<IOfficeAll> }
  | { kind: 'list'; value: IOfficeAll[] };

const initialState = createStoreInitialState<OfficeData, IOfficeAll>();

export const OfficeStore = signalStore(
  withState(initialState),
  withMethods((
    store,
    officeService = inject(OfficeService),
    translateService = inject(TranslateService),
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

      loadPage({ page, sort, direction, size }: PageRequest): void {
        patchState(store, { data: undefined, isLoading: true });

        officeService.getOfficesPage(page, sort, direction, size).subscribe({
          next: (value) => patchState(store, { data: { kind: 'pagination', value }, isLoading: false }),
          error: patchError,
        });
      },

      loadMyOffices(): void {
        patchState(store, { data: undefined, isLoading: true });

        officeService.getAllMyOffices().subscribe({
          next: (value) => patchState(store, { data: { kind: 'list', value: value }, isLoading: false }),
          error: patchError,
        });
      },

      loadById(id: string): void {
        patchState(store, { selected: undefined, isLoading: true });

        officeService.getOffice(id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      create(office: IOffice): void {
        cleanCrudCreate(store);

        officeService.createOffice(office).subscribe({
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
        cleanCrudUpdate(store);

        officeService.updateOffice(id, office).subscribe({
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
        cleanCrudDelete(store);

        officeService.deleteOffice(id).subscribe({
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
