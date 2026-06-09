import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IApiResponse, PageRequest } from '../interfaces/common';
import { IOffice, IOfficeAll } from '../office/office';
import { Pagination } from '../interfaces/pagination';
import { IUserAll } from '../user/user';
import { OfficeService } from '../services/office.service';
import { UserService } from '../services/user.service';
import { createStoreInitialState, mapCrudHttpError, StoreState } from './crud-signal-store';

export type OfficeData =
  | { kind: 'pagination'; value: Pagination<IOfficeAll> }
  | { kind: 'list'; value: IOfficeAll[] };

type OfficeStoreState = StoreState<OfficeData, IOfficeAll> & {
  managers: IUserAll[] | undefined;
};

const initialState: OfficeStoreState = {
  ...createStoreInitialState<OfficeData, IOfficeAll>(),
  managers: undefined,
};

export const OfficeStore = signalStore(
  withState(initialState),
  withMethods((store, officeService = inject(OfficeService), userService = inject(UserService),
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

      loadPage({ page, sort, direction, size }: PageRequest): void {
        patchState(store, {
          data: {
            kind: 'pagination',
            value: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IOfficeAll>,
          },
          subErrors: undefined,
          selected: undefined,
          response: undefined,
        });

        officeService.getOfficesPage(page, sort, direction, size).subscribe({
          next: (value) => patchState(store, {
            data: { kind: 'pagination', value },
            error: undefined,
            subErrors: undefined,
            response: undefined,
          }),
          error: patchError,
        });
      },

      loadManagers(): void {
        patchState(store, {
          managers: undefined,
          subErrors: undefined,
          selected: undefined,
          response: undefined,
        });

        userService.getManagers().subscribe({
          next: (managers) => patchState(store, {
            managers: managers ?? [],
            error: undefined,
            subErrors: undefined,
            response: undefined,
          }),
          error: patchError,
        });
      },

      loadMyOffices(): void {
        patchState(store, {
          data: { kind: 'list', value: [] },
          error: undefined,
          subErrors: undefined,
          response: undefined,
        });

        officeService.getAllMyOffices().subscribe({
          next: (value) => patchState(store, {
            data: { kind: 'list', value: value ?? [] },
            error: undefined,
            subErrors: undefined,
            response: undefined,
          }),
          error: patchError,
        });
      },

      loadById(id: string): void {
        patchState(store, {
          subErrors: undefined,
          selected: undefined,
          response: undefined,
        });

        officeService.getOffice(id).subscribe({
          next: (selected) => patchState(store, {
            selected,
            error: undefined,
            subErrors: undefined,
            response: undefined,
          }),
          error: patchError,
        });
      },

      create(office: IOffice): void {
        patchState(store, {
          selected: undefined,
          subErrors: undefined,
          response: undefined,
          isLoading: true,
        });

        officeService.createOffice(office).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('OFFICE.CREATED', { name: response.name }),
              path: `offices/${ response.id }`,
              redirect: 'offices',
            },
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update(id: string, office: IOffice): void {
        patchState(store, {
          selected: undefined,
          subErrors: undefined,
          response: undefined,
          isLoading: true,
        });

        officeService.updateOffice(id, office).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('OFFICE.UPDATED.MESSAGE', { name: response.name }),
              path: `offices/${ response.id }`,
              redirect: 'offices',
            },
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete(id: string, name: string): void {
        patchState(store, {
          selected: undefined,
          subErrors: undefined,
          response: undefined,
          isLoading: true,
        });

        officeService.deleteOffice(id).subscribe({
          next: () => patchState(store, {
            response: {
              message: translate.instant('OFFICE.DELETED.MESSAGE', { name }),
              redirect: 'offices',
              reload: true,
              toastType: 'warning',
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
