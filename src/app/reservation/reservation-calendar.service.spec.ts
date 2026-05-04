import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { CalendarEvent } from 'angular-calendar';
import { ReservationCalendarService } from './reservation-calendar.service';
import { ServiceType } from '../interfaces/room';
import { FrequencyEnum } from '../util/helper';

describe('ReservationCalendarService', () => {
  let service: ReservationCalendarService;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  const room: any = {
    id: 'room-1',
    timeZone: 'Europe/Amsterdam',
    paymentTypes: ['CASH'],
    primary: true,
    address: { id: 1, name: 'Room', location: { x: 0, y: 0 } },
    office: { id: 'office-1', name: 'Office' },
    currency: { id: 'eur', code: 'EUR', icon: 'EUR', name: 'Euro' },
    professionals: [{ id: 'professional-1', displayName: 'Professional' }],
    availabilities: [
      { day: 'MONDAY', start: '09:00', end: '17:00' },
      { day: 'TUESDAY', start: '10:00', end: '18:00' },
    ],
  };

  beforeEach(() => {
    translateSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translateSpy.instant.and.callFake((key: string, params?: Record<string, unknown>) =>
      `${key}${params ? `:${JSON.stringify(params)}` : ''}`);

    TestBed.configureTestingModule({
      providers: [
        ReservationCalendarService,
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    service = TestBed.inject(ReservationCalendarService);
  });

  it('should derive room schedule boundaries from room availability', () => {
    const schedule = service.getRoomSchedule(room);

    expect(schedule.minTime).toBe('09:00');
    expect(schedule.maxTime).toBe('18:00');
    expect(schedule.weekendDays).toContain(0);
    expect(schedule.day.dayStartHour).toBeDefined();
    expect(schedule.day.dayEndHour).toBeDefined();
  });

  it('should add recurring availability events to the data event', () => {
    const addNotAvailableRecurring = jasmine.createSpy('addNotAvailableRecurring');
    const dataEvent: any = {
      recurringEvent: { addNotAvailableRecurring },
    };

    const schedule = service.addRoomAvailabilityEvents(dataEvent, room, false);

    expect(addNotAvailableRecurring).toHaveBeenCalled();
    expect(schedule.minTime).toBe('09:00');
  });

  it('should still derive room availability when recurring helpers are missing', () => {
    const schedule = service.addRoomAvailabilityEvents({} as any, room, false);

    expect(schedule.minTime).toBe('09:00');
    expect(schedule.maxTime).toBe('18:00');
  });

  it('should return room schedule without min and max time when availability is missing', () => {
    const noAvailabilityRoom = { ...room, availabilities: [] };

    const schedule = service.getRoomSchedule(noAvailabilityRoom as any);

    expect(schedule.minTime).toBeUndefined();
    expect(schedule.maxTime).toBeUndefined();
  });

  it('should build reservation events for future reservations and exclude current one', () => {
    const futureTimestamp = Math.floor(Date.now() / 1000) + 7200;
    const reservations: any[] = [
      {
        id: 'reservation-1',
        timestamp: futureTimestamp,
        state: 'CREATED',
        room,
        professional: { id: 'professional-1', displayName: 'Professional' },
        customer: { displayName: 'Customer' },
        treatment: { id: 'treatment-1', key: 'treatment-1', name: 'Treatment', duration: 'PT1H', type: ServiceType.treatment },
        additional: [{ name: 'Extra', duration: 'PT30M' }],
      },
      {
        id: 'reservation-2',
        timestamp: futureTimestamp,
        state: 'CREATED',
        room,
        professional: { id: 'professional-1', displayName: 'Professional' },
        customer: { displayName: 'Customer' },
        treatment: { id: 'treatment-1', key: 'treatment-1', name: 'Treatment', duration: 'PT1H', type: ServiceType.treatment },
        additional: [],
      },
    ];

    const events = service.buildReservationEvents(reservations as any, 'reservation-2', false);

    expect(events.length).toBe(1);
    expect(events[0].id).toBe('reservation-1');
    expect((events[0] as CalendarEvent).meta.isReservation).toBeTrue();
  });

  it('should skip reservations without duration or in the past', () => {
    const pastTimestamp = Math.floor(Date.now() / 1000) - 7200;
    const events = service.buildReservationEvents([
      {
        id: 'reservation-past',
        timestamp: pastTimestamp,
        state: 'CREATED',
        room,
        professional: { id: 'professional-1', displayName: 'Professional' },
        customer: { displayName: 'Customer' },
        treatment: { id: 'treatment-1', key: 'treatment-1', name: 'Treatment', duration: 'PT1H', type: ServiceType.treatment },
        additional: [],
      },
      {
        id: 'reservation-no-duration',
        timestamp: Math.floor(Date.now() / 1000) + 7200,
        state: 'CREATED',
        room,
        professional: { id: 'professional-1', displayName: 'Professional' },
        customer: { displayName: 'Customer' },
        treatment: { id: 'treatment-1', key: 'treatment-1', name: 'Treatment', duration: '' as any, type: ServiceType.treatment },
        additional: [],
      },
    ] as any, undefined, false);

    expect(events).toEqual([]);
  });

  it('should add unavailable events with the correct route prefix', () => {
    const addFrequency = jasmine.createSpy('addFrequency');
    const dataEvent: any = {
      recurringEvent: { addFrequency },
    };
    const unavailableList: any[] = [
      {
        id: 'unavailable-1',
        description: 'Busy',
        timestamp: Math.floor(Date.now() / 1000) + 3600,
        duration: 'PT1H',
        professional: { id: 'professional-1', displayName: 'Professional' },
        repeat: FrequencyEnum.everyDay,
        allDay: false,
        type: 'BLOCK_AGENDA',
      },
    ];

    service.addUnavailableEvents(dataEvent, unavailableList as any, room.timeZone, false, () => undefined);

    expect(addFrequency).toHaveBeenCalled();
    expect(addFrequency.calls.mostRecent().args[5]).toBe('unavailable/block-agenda/');
  });

  it('should skip unavailable entries without duration and not all-day', () => {
    const addFrequency = jasmine.createSpy('addFrequency');

    service.addUnavailableEvents(
      { recurringEvent: { addFrequency } } as any,
      [{
        id: 'unavailable-1',
        timestamp: Math.floor(Date.now() / 1000) + 3600,
        duration: undefined,
        professional: { id: 'professional-1', displayName: 'Professional' },
        repeat: FrequencyEnum.everyDay,
        allDay: false,
      }] as any,
      room.timeZone,
      false,
      () => undefined,
    );

    expect(addFrequency).not.toHaveBeenCalled();
  });

  it('should use the default unavailable route for non block agenda entries', () => {
    const addFrequency = jasmine.createSpy('addFrequency');

    service.addUnavailableEvents(
      { recurringEvent: { addFrequency } } as any,
      [{
        id: 'unavailable-1',
        description: '',
        timestamp: Math.floor(Date.now() / 1000) + 3600,
        duration: 'PT1H',
        professional: { id: 'professional-1', displayName: 'Professional' },
        repeat: FrequencyEnum.everyDay,
        allDay: true,
      }] as any,
      room.timeZone,
      false,
      () => undefined,
    );

    expect(addFrequency.calls.mostRecent().args[5]).toBe('unavailable/');
  });

  it('should normalize all-day unavailable starts and wire the validation callback', () => {
    const validateUnavailable = jasmine.createSpy('validateUnavailable');
    const addFrequency = jasmine.createSpy('addFrequency');
    const dataEvent: any = {
      recurringEvent: { addFrequency },
    };
    const unavailable = {
      id: 'unavailable-1',
      description: '',
      timestamp: Math.floor(new Date('2026-04-10T09:30:00Z').getTime() / 1000),
      duration: 'PT1H',
      professional: { id: 'professional-1', displayName: 'Professional' },
      repeat: FrequencyEnum.everyDay,
      allDay: true,
    };

    service.addUnavailableEvents(dataEvent, [unavailable] as any, room.timeZone, false, validateUnavailable);

    const [, start, , , , , callback] = addFrequency.calls.mostRecent().args;
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);

    callback(new Date('2026-04-11T00:00:00Z'), { id: 'recurring-1' });
    expect(validateUnavailable).toHaveBeenCalledWith(
      jasmine.any(Date),
      { id: 'recurring-1' },
      dataEvent,
    );
  });

  it('should create unavailable calendar events', () => {
    const start = new Date(Date.now() + 60 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const event = service.createUnavailableEvent(
      { allDay: false, professionalId: 'professional-1', title: 'Unavailable', path: 'unavailable/' },
      start,
      end,
      room.timeZone,
      false,
    );

    expect(event.title).toBe('Unavailable');
    expect(event.meta.professionalId).toBe('professional-1');
  });

  it('should create reservation selection events with reservation meta', () => {
    const start = new Date(Date.now() + 60 * 60 * 1000);
    const end = new Date(start.getTime() + (90 * 60 * 1000));
    const event = service.createSelectionEvent({
      treatment: { id: 'treatment-1', key: 'treatment-1', name: 'Treatment', duration: 'PT1H', price: 100, type: ServiceType.treatment },
      customer: { id: 'customer-1', displayName: 'Customer' } as any,
      additional: [{ id: 'additional-1', name: 'Extra', duration: 'PT30M', key: 'additional-1', price: 15, type: ServiceType.additional } as any],
      professional: { id: 'professional-1', displayName: 'Professional' } as any,
      start,
      end,
      state: 'CREATED',
      timeZone: room.timeZone,
      id: 'event-1',
      isDarkMode: false,
    });

    expect(event.id).toBe('event-1');
    expect(event.meta.isReservation).toBeTrue();
    expect(event.meta.professionalId).toBe('professional-1');
    expect(event.meta.treatmentName).toBe('Treatment');
    expect(event.meta.additionalNames).toEqual(['Extra']);
  });

  it('should create selection events without a professional', () => {
    const start = new Date(Date.now() + 60 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const event = service.createSelectionEvent({
      treatment: { id: 'treatment-1', key: 'treatment-1', name: 'Treatment', duration: 'PT1H', price: 100, type: ServiceType.treatment },
      customer: { id: 'customer-1', displayName: 'Customer' } as any,
      additional: [],
      start,
      end,
      state: 'CREATED',
      timeZone: room.timeZone,
      id: 'event-2',
      isDarkMode: false,
    });

    expect(event.meta.professionalId).toBeUndefined();
    expect(event.id).toBe('event-2');
    expect(event.meta.treatmentName).toBe('Treatment');
    expect(event.meta.additionalNames).toEqual([]);
  });
});
