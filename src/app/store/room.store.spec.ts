import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { RoomService } from '../services/room.service';
import { RoomStore } from './room.store';
import { DEFAULT_LOCALE } from '../util/dates';
import { NavigationService } from '../services/navigation.service';

describe('RoomStore', () => {
  let store: InstanceType<typeof RoomStore>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;
  let roomServiceSpy: jasmine.SpyObj<RoomService>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );
    roomServiceSpy = jasmine.createSpyObj<RoomService>('RoomService', [
      'getRoomsPage',
      'getAllRoomsInfo',
      'getRoom',
      'createRoom',
      'updateRoom',
      'deleteRoom',
      'getServices',
      'updateServices',
      'getAllCustomersInfo',
    ]);
    translateSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant', 'getCurrentLang']);
    translateSpy.instant.and.callFake(
      (key: string, params?: Record<string, string>) => `${ key }:${ params?.['name'] ?? '' }`);
    translateSpy.getCurrentLang.and.returnValue(DEFAULT_LOCALE);

    TestBed.configureTestingModule({
      providers: [
        RoomStore,
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: RoomService, useValue: roomServiceSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    store = TestBed.inject(RoomStore);
  });

  it('should load page, room info, selected room, services, and customers', () => {
    const page = { content: [{ id: 'room-1' }], totalElements: 1 } as any;
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
    roomServiceSpy.getRoomsPage.and.returnValue(of(page));
    roomServiceSpy.getAllRoomsInfo.and.returnValue(of(roomInfo));
    roomServiceSpy.getRoom.and.returnValue(of(room));
    roomServiceSpy.getServices.and.returnValue(of(services));
    roomServiceSpy.getAllCustomersInfo.and.returnValue(of(customers));

    store.loadPage({ page: 0, sort: 'office', direction: 'asc', size: 10 });
    store.loadInfo();
    store.loadById('room-1');
    store.loadServices('room-1');
    store.loadCustomers('room-1');

    expect(store.data()).toBe(page);
    expect(store.professionals()).toEqual(roomInfo.professionals);
    expect(store.offices()).toEqual(roomInfo.offices);
    expect(store.currencies()).toEqual(roomInfo.currencies);
    expect(store.selected()).toBe(room);
    expect(store.services()).toBe(services);
    expect(store.customers()).toBe(customers);
  });

  it('should expose response metadata for create, update, delete, and service update success', () => {
    roomServiceSpy.createRoom.and.returnValue(of({ id: 'room-1', name: 'Room 1' } as any));
    roomServiceSpy.updateRoom.and.returnValue(of({ id: 'room-1', name: 'Room Updated' } as any));
    roomServiceSpy.deleteRoom.and.returnValue(of({} as any));
    roomServiceSpy.updateServices.and.returnValue(of(void 0));

    store.create({} as any);
    expect(store.response()).toEqual({
      message: 'ROOM.CREATED:Room 1',
      path: 'rooms/room-1',
      redirect: 'rooms',
    });

    store.update('room-1', {} as any);
    expect(store.response()).toEqual({
      message: 'ROOM.UPDATED.MESSAGE:Room Updated',
      path: 'rooms/room-1',
      redirect: 'rooms',
    });

    store.delete({ id: 'room-1', address: { name: 'Main' } } as any);
    expect(store.response()).toEqual({
      message: 'ROOM.DELETED.MESSAGE:',
      reload: true,
      toastType: 'warning',
    });

    store.updateServices('room-1', []);
    expect(store.response()).toEqual({ message: 'ROOM.ME.SERVICES.UPDATE.MESSAGE' });
    expect(store.isLoading()).toBeFalse();
  });

  it('should select and navigate to room details', () => {
    const room = { id: 'room-1' } as any;

    store.selectAndNavigate(room);

    expect(store.selected()).toBe(room);
    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['rooms', 'room-1']);
  });

  it('should clear response and error state', () => {
    roomServiceSpy.createRoom.and.returnValue(of({ id: 'room-1', name: 'Room 1' } as any));

    store.create({} as any);
    store.clearResponse();
    store.clearError();

    expect(store.response()).toBeUndefined();
    expect(store.error()).toBeUndefined();
    expect(store.subErrors()).toBeUndefined();
  });

  it('should map service failures into error state', () => {
    roomServiceSpy.getRoom.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 404,
      error: {
        message: 'ROOM.NOT_FOUND',
      },
    })));

    store.loadById('missing');

    expect(store.response()).toBeUndefined();
    expect(store.error()).toEqual(jasmine.objectContaining({
      status: 'NOT_FOUND',
      message: 'ROOM.NOT_FOUND',
    }));
    expect(store.isLoading()).toBeFalse();
  });
});
