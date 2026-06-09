import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IResponseSuccess, PageRequest } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';
import { IRoomAll } from '../interfaces/room';
import { IUnavailable, IUnavailableAll } from '../interfaces/unavailable';
import { IUserAll } from '../interfaces/user';
import { UnavailableService } from '../services/unavailable.service';
import { UserService } from '../services/user.service';
import { newDateTimestamp } from '../util/dates';
import { createStoreInitialState, mapCrudHttpError, StoreState } from './crud-signal-store';

export type UnavailableNavigationParams = {
  date?: Date;
  room?: IRoomAll;
  startTime?: string;
  showDuration: boolean;
};

type UnavailableStoreState = StoreState<Pagination<IUnavailableAll>, IUnavailableAll> & {
  professionals: IUserAll[] | undefined;
  rooms: IRoomAll[] | undefined;
};

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

const initialState: UnavailableStoreState = {
  ...createStoreInitialState<Pagination<IUnavailableAll>, IUnavailableAll>(),
  professionals: undefined,
  rooms: undefined,
};

export const UnavailableStore = signalStore(
  withState(initialState),
  withMethods((store, unavailableService = inject(UnavailableService), userService = inject(UserService),
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

    const patchSavingState = (): void => {
      patchState(store, {
        subErrors: undefined,
        response: undefined,
        error: undefined,
        isLoading: true,
      });
    };

    const createResponse = (key: string, timestamp: number | undefined, path?: string): IResponseSuccess => ({
      message: translate.instant(key, { date: newDateTimestamp(timestamp) }),
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
        patchState(store, {
          data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IUnavailableAll>,
          subErrors: undefined,
          selected: undefined,
          response: undefined,
          error: undefined,
        });

        unavailableService.getUnavailablePage(request.page, request.sort, request.direction, request.size).subscribe({
          next: (data) => patchState(store, {
            data,
            subErrors: undefined,
            response: undefined,
            error: undefined,
          }),
          error: patchError,
        });
      },

      loadProfessionals(): void {
        patchState(store, {
          professionals: undefined,
          subErrors: undefined,
          response: undefined,
          error: undefined,
        });

        userService.getProfessionals().subscribe({
          next: (professionals) => patchState(store, {
            professionals,
            subErrors: undefined,
            response: undefined,
            error: undefined,
          }),
          error: patchError,
        });
      },

      loadRoomsByProfessionalId(professionalId: string): void {
        patchState(store, {
          rooms: undefined,
          subErrors: undefined,
          response: undefined,
          error: undefined,
        });

        userService.getAllRoomsByProfessionalId(professionalId).subscribe({
          next: (rooms) => patchState(store, {
            rooms,
            subErrors: undefined,
            response: undefined,
            error: undefined,
          }),
          error: patchError,
        });
      },

      loadById(id: string): void {
        patchState(store, {
          selected: undefined,
          subErrors: undefined,
          response: undefined,
          error: undefined,
        });

        unavailableService.getUnavailable(id).subscribe({
          next: (selected) => patchState(store, { selected }),
          error: patchError,
        });
      },

      create(unavailable: IUnavailable, isRoomAdmin: boolean): void {
        patchSavingState();

        unavailableService.createUnavailable(unavailable).subscribe({
          next: (response) => patchState(store, {
            response: createResponse(
              'UNAVAILABLE.CREATED',
              response.timestamp,
              isRoomAdmin ? 'dashboard/events' : `unavailable/${ response.id }`,
            ),
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      createBlockAgenda(unavailable: IUnavailable, isRoomAdmin: boolean): void {
        patchSavingState();

        unavailableService.createBlockAgenda(unavailable).subscribe({
          next: (response) => patchState(store, {
            response: createResponse(
              'UNAVAILABLE.CREATED',
              response.timestamp,
              isRoomAdmin ? 'dashboard/events' : `unavailable/block-agenda/${ response.id }`,
            ),
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update({ id, unavailable, path }: UpdateUnavailableArgs): void {
        patchSavingState();

        unavailableService.updateUnavailable(id, unavailable).subscribe({
          next: (response) => patchState(store, {
            response: createResponse('UNAVAILABLE.UPDATED.MESSAGE', response.timestamp, `${ path }/${ response.id }`),
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete({ id, timestamp, timeZone }: DeleteUnavailableArgs): void {
        patchSavingState();

        unavailableService.deleteUnavailable(id).subscribe({
          next: () => patchState(store, {
            response: {
              message: translate.instant('UNAVAILABLE.DELETED.MESSAGE', {
                date: newDateTimestamp(timestamp, timeZone),
              }),
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
