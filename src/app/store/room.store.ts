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
import {
  cleanCrudCreate, cleanCrudDelete,
  cleanCrudUpdate,
  createStoreInitialState,
  patchCrudError,
  StoreState,
} from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';

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
    const patchError = (err: HttpErrorResponse): void => patchCrudError(store, err);

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
        patchState(store, { data: undefined, isLoading: true });

        roomService.getRoomsPage(page, sort, direction, size).subscribe({
          next: (data) => patchState(store, { data, isLoading: false }),
          error: patchError,
        });
      },

      loadInfo(): void {
        patchState(store, { professionals: undefined, offices: undefined, currencies: undefined, isLoading: true });

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
        patchState(store, { selected: undefined, isLoading: true });

        roomService.getRoom(id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      create(room: IRoom): void {
        cleanCrudCreate(store);

        roomService.createRoom(room).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: createSaveResponse(translate.instant('ROOM.CREATED', { name: response.name }), response),
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update(id: string, room: IRoom): void {
        cleanCrudUpdate(store);

        roomService.updateRoom(id, room).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: createSaveResponse(translate.instant('ROOM.UPDATED.MESSAGE', { name: response.name }), response),
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete(room: IRoom): void {
        cleanCrudDelete(store);

        roomService.deleteRoom(room.id!).subscribe({
          next: () => patchState(store, {
            response: {
              message: translate.instant('ROOM.DELETED.MESSAGE', { name: roomName(room) }),
              reload: true,
              toastType: 'warning',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadServices(id: string): void {
        patchState(store, { services: undefined, isLoading: true });

        roomService.getServices(id).subscribe({
          next: (services) => patchState(store, { services, isLoading: false }),
          error: patchError,
        });
      },

      updateServices(id: string, prices: IServicePrice[]): void {
        patchState(store, { services: undefined, response: undefined, isLoading: true });

        roomService.updateServices(id, prices).subscribe({
          next: () => patchState(store, {
            response: { message: 'ROOM.ME.SERVICES.UPDATE.MESSAGE' },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadCustomers(id: string): void {
        patchState(store, { customers: undefined, isLoading: true });

        roomService.getAllCustomersInfo(id).subscribe({
          next: (customers) => patchState(store, { customers, isLoading: false }),
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
