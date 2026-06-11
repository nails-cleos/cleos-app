import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IApiResponse, IResponseSuccess, PageRequest } from '../interfaces/common';
import { ICurrencyAll } from '../currency/currency';
import { IOfficeAll } from '../office/office';
import { Pagination } from '../interfaces/pagination';
import { IRoom, IRoomAll, IRoomCustomer, IRoomInfo, IRoomService, IServicePrice } from '../room/room';
import { IUserAll } from '../user/user';
import { RoomService } from '../services/room.service';
import { roomName } from '../util/helper';
import { createStoreInitialState, mapCrudHttpError, StoreState } from './crud-signal-store';

type RoomStoreState = StoreState<Pagination<IRoom>, IRoomAll> & {
  services: IRoomService | undefined;
  professionals: IUserAll[] | undefined;
  currencies: ICurrencyAll[] | undefined;
  offices: IOfficeAll[] | undefined;
  customers: IRoomCustomer[] | undefined;
};

const initialState: RoomStoreState = {
  ...createStoreInitialState<Pagination<IRoom>, IRoomAll>(),
  services: undefined,
  professionals: undefined,
  currencies: undefined,
  offices: undefined,
  customers: undefined,
};

export const RoomStore = signalStore(
  withState(initialState),
  withMethods((
    store,
    roomService = inject(RoomService),
    translate = inject(TranslateService),
    router = inject(Router),
  ) => {
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
        selected: undefined,
        subErrors: undefined,
        response: undefined,
        error: undefined,
        isLoading: true,
      });
    };

    const createSaveResponse = (message: string, response: IApiResponse): IResponseSuccess => ({
      message,
      path: `rooms/${ response.id }`,
      redirect: 'rooms',
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

      loadPage({ page, sort, direction, size }: PageRequest): void {
        patchState(store, {
          data: undefined,
          subErrors: undefined,
          selected: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        roomService.getRoomsPage(page, sort, direction, size).subscribe({
          next: (data) => patchState(store, {
            data,
            subErrors: undefined,
            response: undefined,
            error: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadInfo(): void {
        patchState(store, {
          professionals: undefined,
          currencies: undefined,
          offices: undefined,
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        roomService.getAllRoomsInfo().subscribe({
          next: (roomInfo: IRoomInfo) => patchState(store, {
            professionals: roomInfo?.professionals,
            offices: roomInfo?.offices,
            currencies: roomInfo?.currencies,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadById(id: string): void {
        patchState(store, {
          subErrors: undefined,
          selected: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        roomService.getRoom(id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      create(room: IRoom): void {
        patchSavingState();

        roomService.createRoom(room).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: createSaveResponse(translate.instant('ROOM.CREATED', { name: response.name }), response),
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update(id: string, room: IRoom): void {
        patchSavingState();

        roomService.updateRoom(id, room).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: createSaveResponse(translate.instant('ROOM.UPDATED.MESSAGE', { name: response.name }), response),
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete(room: IRoom): void {
        patchSavingState();

        roomService.deleteRoom(room.id!).subscribe({
          next: () => patchState(store, {
            response: {
              message: translate.instant('ROOM.DELETED.MESSAGE', { name: roomName(room) }),
              reload: true,
              toastType: 'warning',
            },
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadServices(id: string): void {
        patchState(store, {
          services: undefined,
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        roomService.getServices(id).subscribe({
          next: (services) => patchState(store,
            { services, isLoading: false }),
          error: patchError,
        });
      },

      updateServices(id: string, prices: IServicePrice[]): void {
        patchSavingState();

        roomService.updateServices(id, prices).subscribe({
          next: () => patchState(store, {
            response: { message: 'ROOM.ME.SERVICES.UPDATE.MESSAGE' },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadCustomers(id: string): void {
        patchState(store, {
          customers: undefined,
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        roomService.getAllCustomersInfo(id).subscribe({
          next: (customers) => patchState(store,
            { customers, isLoading: false }),
          error: patchError,
        });
      },

      selectAndNavigate(selected: IRoomAll): void {
        patchState(store, { selected });
        router.navigate([translate.getCurrentLang(), 'rooms', selected?.id]);
      },
    };
  }),
);
