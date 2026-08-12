import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
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
import type { Subscription } from 'rxjs';

const initialState = createStoreInitialState<
  Pagination<IUnavailableAll>,
  IUnavailableAll
>();

export const UnavailableStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, unavailableService = inject(UnavailableService)) => {
    let loadPageSubscription: Subscription | undefined;
    let loadByIdSubscription: Subscription | undefined;
    let createSubscription: Subscription | undefined;
    let createBlockAgendaSubscription: Subscription | undefined;
    let updateSubscription: Subscription | undefined;
    let deleteSubscription: Subscription | undefined;

    const cancelAll = (): void => {
      loadPageSubscription?.unsubscribe();
      loadByIdSubscription?.unsubscribe();
      createSubscription?.unsubscribe();
      createBlockAgendaSubscription?.unsubscribe();
      updateSubscription?.unsubscribe();
      deleteSubscription?.unsubscribe();
    };
    const patchError = (err: HttpErrorResponse): void =>
      patchCrudError(store, err);

    const createResponse = (
      messageKey: string,
      timestamp: number | undefined,
      path?: string,
    ): IResponseSuccess => ({
      messageKey,
      messageParams: {
        date: newDateTimestamp(timestamp),
      },
      path,
      redirect: 'unavailable',
    });

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

        loadPageSubscription = unavailableService
          .getUnavailablePage(page, sort, direction, size)
          .subscribe({
            next: (data) => patchState(store, { data, isLoading: false }),
            error: patchError,
          });
      },

      loadById(id: string): void {
        loadByIdSubscription?.unsubscribe();
        patchState(store, { selected: undefined, isLoading: true });

        loadByIdSubscription = unavailableService.getUnavailable(id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      create(unavailable: IUnavailable, isRoomAdmin: boolean): void {
        createSubscription?.unsubscribe();
        cleanCrudCreate(store);

        createSubscription = unavailableService
          .createUnavailable(unavailable)
          .subscribe({
            next: (response) =>
              patchState(store, {
                response: createResponse(
                  'UNAVAILABLE.CREATED',
                  response.timestamp,
                  isRoomAdmin
                    ? 'dashboard/events'
                    : `unavailable/${response.id}`,
                ),
                isLoading: false,
              }),
            error: patchError,
          });
      },

      createBlockAgenda(unavailable: IUnavailable, isRoomAdmin: boolean): void {
        createBlockAgendaSubscription?.unsubscribe();
        cleanCrudCreate(store);

        createBlockAgendaSubscription = unavailableService
          .createBlockAgenda(unavailable)
          .subscribe({
            next: (response) =>
              patchState(store, {
                response: createResponse(
                  'UNAVAILABLE.CREATED',
                  response.timestamp,
                  isRoomAdmin
                    ? 'dashboard/events'
                    : `unavailable/block-agenda/${response.id}`,
                ),
                isLoading: false,
              }),
            error: patchError,
          });
      },

      update(id: string, unavailable: IUnavailable, path: string): void {
        updateSubscription?.unsubscribe();
        cleanCrudUpdate(store);

        updateSubscription = unavailableService
          .updateUnavailable(id, unavailable)
          .subscribe({
            next: (response) =>
              patchState(store, {
                response: createResponse(
                  'UNAVAILABLE.UPDATED.MESSAGE',
                  response.timestamp,
                  `${path}/${response.id}`,
                ),
                isLoading: false,
              }),
            error: patchError,
          });
      },

      delete(id: string, timestamp: number, timeZone?: string): void {
        deleteSubscription?.unsubscribe();
        cleanCrudDelete(store);

        deleteSubscription = unavailableService
          .deleteUnavailable(id)
          .subscribe({
            next: () =>
              patchState(store, {
                response: {
                  messageKey: 'UNAVAILABLE.DELETED.MESSAGE',
                  messageParams: {
                    date: newDateTimestamp(timestamp, timeZone),
                  },
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
