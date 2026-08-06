import { inject } from '@angular/core';
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
  cleanCrudCreate,
  cleanCrudDelete,
  cleanCrudUpdate,
  createStoreInitialState,
  patchCrudError,
  StoreState,
} from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';
import { NavigationService } from '../services/navigation.service';
import type { Subscription } from 'rxjs';

type RoomData =
  | { kind: 'pagination'; value?: Pagination<IRoomAll> }
  | { kind: 'list'; value?: IRoomAll[] };

type RoomStoreState = StoreState<RoomData, IRoomAll> & {
  services: IRoomService | undefined;
  professionals: IUserAll[] | undefined;
  currencies: ICurrencyAll[] | undefined;
  offices: IOfficeAll[] | undefined;
  customers: IRoomCustomer[] | undefined;
};

const initialState: RoomStoreState = {
  ...createStoreInitialState<RoomData, IRoomAll>(),
  services: undefined,
  professionals: undefined,
  currencies: undefined,
  offices: undefined,
  customers: undefined,
};

export const RoomStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((
    store,
    roomService = inject(RoomService),
    translateService = inject(TranslateService),
    navigationService = inject(NavigationService),
  ) => {
    let loadPageSubscription: Subscription | undefined;
    let loadAllSubscription: Subscription | undefined;
    let loadInfoSubscription: Subscription | undefined;
    let loadByIdSubscription: Subscription | undefined;
    let createSubscription: Subscription | undefined;
    let updateSubscription: Subscription | undefined;
    let deleteSubscription: Subscription | undefined;
    let loadServicesSubscription: Subscription | undefined;
    let updateServicesSubscription: Subscription | undefined;
    let loadCustomersSubscription: Subscription | undefined;

    const cancelAll = (): void => {
      loadPageSubscription?.unsubscribe();
      loadAllSubscription?.unsubscribe();
      loadInfoSubscription?.unsubscribe();
      loadByIdSubscription?.unsubscribe();
      createSubscription?.unsubscribe();
      updateSubscription?.unsubscribe();
      deleteSubscription?.unsubscribe();
      loadServicesSubscription?.unsubscribe();
      updateServicesSubscription?.unsubscribe();
      loadCustomersSubscription?.unsubscribe();
    };

    const patchError = (err: HttpErrorResponse): void => patchCrudError(store, err);

    const createSaveResponse = (message: string, response: IApiResponse): IResponseSuccess => ({
      message,
      path: `rooms/${ response.id }`,
      redirect: 'rooms',
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

        loadPageSubscription = roomService.getRoomsPage(page, sort, direction, size).subscribe({
          next: (value) => patchState(store, { data: { kind: 'pagination', value }, isLoading: false }),
          error: patchError,
        });
      },

      loadAll(customerId?: string): void {
        loadAllSubscription?.unsubscribe();
        patchState(store, { customers: undefined, isLoading: true });

        loadAllSubscription = roomService.loadAll(customerId).subscribe({
          next: (value) => patchState(store, { data: { kind: 'list', value }, isLoading: false }),
          error: patchError,
        });
      },

      loadInfo(): void {
        loadInfoSubscription?.unsubscribe();
        patchState(store, { professionals: undefined, offices: undefined, currencies: undefined, isLoading: true });

        loadInfoSubscription = roomService.getAllRoomsInfo().subscribe({
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
        loadByIdSubscription?.unsubscribe();
        patchState(store, { selected: undefined, isLoading: true });

        loadByIdSubscription = roomService.getRoom(id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      create(room: IRoom): void {
        createSubscription?.unsubscribe();
        cleanCrudCreate(store);

        createSubscription = roomService.createRoom(room).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: createSaveResponse(translateService.instant('ROOM.CREATED', { name: response.name }), response),
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update(id: string, room: IRoom): void {
        updateSubscription?.unsubscribe();
        cleanCrudUpdate(store);

        updateSubscription = roomService.updateRoom(id, room).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: createSaveResponse(translateService.instant('ROOM.UPDATED.MESSAGE', { name: response.name }),
              response),
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete(room: IRoom): void {
        deleteSubscription?.unsubscribe();
        cleanCrudDelete(store);

        deleteSubscription = roomService.deleteRoom(room.id!).subscribe({
          next: () => patchState(store, {
            response: {
              message: translateService.instant('ROOM.DELETED.MESSAGE', { name: roomName(room) }),
              reload: true,
              toastType: 'warning',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadServices(id: string): void {
        loadServicesSubscription?.unsubscribe();
        patchState(store, { services: undefined, isLoading: true });

        loadServicesSubscription = roomService.getServices(id).subscribe({
          next: (services) => patchState(store, { services, isLoading: false }),
          error: patchError,
        });
      },

      updateServices(id: string, prices: IServicePrice[]): void {
        updateServicesSubscription?.unsubscribe();
        patchState(store, { services: undefined, response: undefined, isLoading: true });

        updateServicesSubscription = roomService.updateServices(id, prices).subscribe({
          next: () => patchState(store, {
            response: { message: 'ROOM.ME.SERVICES.UPDATE.MESSAGE' },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadCustomers(id: string): void {
        loadCustomersSubscription?.unsubscribe();
        patchState(store, { customers: undefined, isLoading: true });

        loadCustomersSubscription = roomService.getAllCustomersInfo(id).subscribe({
          next: (customers) => patchState(store, { customers, isLoading: false }),
          error: patchError,
        });
      },

      selectAndNavigate(selected: IRoomAll): void {
        patchState(store, { selected });
        navigationService.navigate(['rooms', selected?.id]);
      },
    };
  }),
);
