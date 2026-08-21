import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RoomService } from '../services/room.service';
import { RoomStore } from './room.store';
import { DEFAULT_LOCALE } from '../util/dates';
import { NavigationService } from '../services/navigation.service';

describe('RoomStore', () => {
  let store: InstanceType<typeof RoomStore>;
  let navigationServiceSpy: Pick<NavigationService, 'navigate' | 'language'> & {
    navigate: ReturnType<typeof vi.fn>;
  };
  let roomServiceSpy: {
    getRoomsPage: Mock;
    getAllRoomsInfo: Mock;
    getRoom: Mock;
    createRoom: Mock;
    updateRoom: Mock;
    deleteRoom: Mock;
    getServices: Mock;
    updateServices: Mock;
    getAllCustomersInfo: Mock;
  };

  beforeEach(() => {
    navigationServiceSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    roomServiceSpy = {
      getRoomsPage: vi.fn().mockName('RoomService.getRoomsPage'),
      getAllRoomsInfo: vi.fn().mockName('RoomService.getAllRoomsInfo'),
      getRoom: vi.fn().mockName('RoomService.getRoom'),
      createRoom: vi.fn().mockName('RoomService.createRoom'),
      updateRoom: vi.fn().mockName('RoomService.updateRoom'),
      deleteRoom: vi.fn().mockName('RoomService.deleteRoom'),
      getServices: vi.fn().mockName('RoomService.getServices'),
      updateServices: vi.fn().mockName('RoomService.updateServices'),
      getAllCustomersInfo: vi.fn().mockName('RoomService.getAllCustomersInfo'),
    };

    TestBed.configureTestingModule({
      providers: [
        RoomStore,
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: RoomService, useValue: roomServiceSpy },
      ],
    });

    store = TestBed.inject(RoomStore);
  });

  it('should load page, room info, selected room, services, and customers', () => {
    const value = { content: [{ id: 'room-1' }], totalElements: 1 } as any;
    const roomInfo = {
      professionals: [{ id: 'user-1' }],
      offices: [{ id: 'office-1' }],
      currencies: [{ id: 'currency-1' }],
    } as any;
    const room = { id: 'room-1' } as any;
    const services = {
      currency: { code: 'EUR' },
      additionalList: [],
      selectedAdditionalList: [],
      treatments: [],
      selectedTreatments: [],
    } as any;
    const customers = [{ customerId: 'customer-1' }] as any;
    roomServiceSpy.getRoomsPage.mockReturnValue(of(value));
    roomServiceSpy.getAllRoomsInfo.mockReturnValue(of(roomInfo));
    roomServiceSpy.getRoom.mockReturnValue(of(room));
    roomServiceSpy.getServices.mockReturnValue(of(services));
    roomServiceSpy.getAllCustomersInfo.mockReturnValue(of(customers));

    store.loadPage({ page: 0, sort: 'office', direction: 'asc', size: 10 });
    store.loadInfo();
    store.loadById('room-1');
    store.loadServices('room-1');
    store.loadCustomers('room-1');

    expect(store.data()).toEqual({ kind: 'pagination', value });
    expect(store.professionals()).toEqual(roomInfo.professionals);
    expect(store.offices()).toEqual(roomInfo.offices);
    expect(store.currencies()).toEqual(roomInfo.currencies);
    expect(store.selected()).toBe(room);
    expect(store.services()).toBe(services);
    expect(store.customers()).toBe(customers);
  });

  it('should expose response metadata for create, update, delete, and service update success', () => {
    roomServiceSpy.createRoom.mockReturnValue(
      of({ id: 'room-1', name: 'Room 1' } as any),
    );
    roomServiceSpy.updateRoom.mockReturnValue(
      of({ id: 'room-1', name: 'Room Updated' } as any),
    );
    roomServiceSpy.deleteRoom.mockReturnValue(of({} as any));
    roomServiceSpy.updateServices.mockReturnValue(of(void 0));

    store.create({} as any);
    expect(store.response()).toEqual({
      messageKey: 'ROOM.CREATED',
      messageParams: {
        name: 'Room 1',
      },
      path: 'rooms/room-1',
      redirect: 'rooms',
    });

    store.update('room-1', {} as any);
    expect(store.response()).toEqual({
      messageKey: 'ROOM.UPDATED.MESSAGE',
      messageParams: {
        name: 'Room Updated',
      },
      path: 'rooms/room-1',
      redirect: 'rooms',
    });

    store.delete({ id: 'room-1', address: { name: 'Main' } } as any);
    expect(store.response()).toEqual({
      messageKey: 'ROOM.DELETED.MESSAGE',
      messageParams: {
        name: '',
      },
      reload: true,
      toastType: 'warning',
    });

    store.updateServices('room-1', []);
    expect(store.response()).toEqual({
      message: 'ROOM.ME.SERVICES.UPDATE.MESSAGE',
    });
    expect(store.isLoading()).toBe(false);
  });

  it('should select and navigate to room details', () => {
    const room = { id: 'room-1' } as any;

    store.selectAndNavigate(room);

    expect(store.selected()).toBe(room);
    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith([
      'rooms',
      'room-1',
    ]);
  });

  it('should clear response and error state', () => {
    roomServiceSpy.createRoom.mockReturnValue(
      of({ id: 'room-1', name: 'Room 1' } as any),
    );

    store.create({} as any);
    store.clearResponse();
    store.clearError();

    expect(store.response()).toBeUndefined();
    expect(store.error()).toBeUndefined();
    expect(store.subErrors()).toBeUndefined();
  });

  it('should map service failures into error state', () => {
    roomServiceSpy.getRoom.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: {
              message: 'ROOM.NOT_FOUND',
            },
          }),
      ),
    );

    store.loadById('missing');

    expect(store.response()).toBeUndefined();
    expect(store.error()).toEqual(
      expect.objectContaining({
        status: 'NOT_FOUND',
        message: 'ROOM.NOT_FOUND',
      }),
    );
    expect(store.isLoading()).toBe(false);
  });
});
