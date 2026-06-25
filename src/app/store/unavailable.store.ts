import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IResponseSuccess, PageRequest } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';
import { IUnavailable, IUnavailableAll } from '../unavailable/unavailable';
import { UnavailableService } from '../services/unavailable.service';
import { newDateTimestamp } from '../util/dates';
import {
  cleanCrudCreate,
  cleanCrudDelete,
  cleanCrudUpdate,
  createStoreInitialState,
  patchCrudError,
} from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';

type UpdateUnavailableArgs = {
  id: string;
  unavailable: IUnavailable;
  path: string;
};

type DeleteUnavailableArgs = {
  id: string;
  timestamp: number;
  timeZone?: string;
};

const initialState = createStoreInitialState<Pagination<IUnavailableAll>, IUnavailableAll>();

export const UnavailableStore = signalStore(
  withState(initialState),
  withMethods((
    store,
    unavailableService = inject(UnavailableService),
    translateService = inject(TranslateService),
  ) => {
    const patchError = (err: HttpErrorResponse): void => patchCrudError(store, err);

    const createResponse = (key: string, timestamp: number | undefined, path?: string): IResponseSuccess => ({
      message: translateService.instant(key, { date: newDateTimestamp(timestamp) }),
      path,
      redirect: 'unavailable',
    });

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

      loadPage(request: PageRequest): void {
        patchState(store, { data: undefined, isLoading: true });

        unavailableService.getUnavailablePage(request.page, request.sort, request.direction, request.size).subscribe({
          next: (data) => patchState(store, { data, isLoading: false }),
          error: patchError,
        });
      },

      loadById(id: string): void {
        patchState(store, { selected: undefined, isLoading: true });

        unavailableService.getUnavailable(id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      create(unavailable: IUnavailable, isRoomAdmin: boolean): void {
        cleanCrudCreate(store);

        unavailableService.createUnavailable(unavailable).subscribe({
          next: (response) => patchState(store, {
            response: createResponse(
              'UNAVAILABLE.CREATED',
              response.timestamp,
              isRoomAdmin ? 'dashboard/events' : `unavailable/${ response.id }`,
            ),
            isLoading: false,
          }),
          error: patchError,
        });
      },

      createBlockAgenda(unavailable: IUnavailable, isRoomAdmin: boolean): void {
        cleanCrudCreate(store);

        unavailableService.createBlockAgenda(unavailable).subscribe({
          next: (response) => patchState(store, {
            response: createResponse(
              'UNAVAILABLE.CREATED',
              response.timestamp,
              isRoomAdmin ? 'dashboard/events' : `unavailable/block-agenda/${ response.id }`,
            ),
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update({ id, unavailable, path }: UpdateUnavailableArgs): void {
        cleanCrudUpdate(store);

        unavailableService.updateUnavailable(id, unavailable).subscribe({
          next: (response) => patchState(store, {
            response: createResponse('UNAVAILABLE.UPDATED.MESSAGE', response.timestamp, `${ path }/${ response.id }`),
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete({ id, timestamp, timeZone }: DeleteUnavailableArgs): void {
        cleanCrudDelete(store);

        unavailableService.deleteUnavailable(id).subscribe({
          next: () => patchState(store, {
            response: {
              message: translateService.instant('UNAVAILABLE.DELETED.MESSAGE', {
                date: newDateTimestamp(timestamp, timeZone),
              }),
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
