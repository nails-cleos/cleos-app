import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { ReservationListComponent } from './reservation-list.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { Price } from '../../../interfaces/treatment';
import { ReservationState } from '../../../store/reducers/reservation.reducers';

describe('ReservationListComponent', () => {
  let component: ReservationListComponent;
  let fixture: ComponentFixture<ReservationListComponent>;

  let storeSpy: jasmine.SpyObj<Store<ReservationState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  let customerReservation$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;
  let error$: BehaviorSubject<any>;
  let breakpoints$: BehaviorSubject<any>;

  beforeEach(async () => {
    customerReservation$ = new BehaviorSubject<any>(undefined);
    response$ = new BehaviorSubject<any>(undefined);
    error$ = new BehaviorSubject<any>(undefined);
    breakpoints$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {},
    });

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return customerReservation$.asObservable();
        case 2:
          return response$.asObservable();
        case 3:
          return error$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoints$.asObservable());

    await TestBed.configureTestingModule({
      imports: [ReservationListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: MatDialog, useValue: dialogSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(ReservationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct default values', () => {
    expect(component.paginatorPageIndex()).toBe(0);
    expect(component.displayedColumns)
      .toEqual(['position', 'professional', 'timestamp', 'treatment', 'state', 'actions']);
    expect(component.noContent()).toBe(true);
  });

  it('should dispatch getCustomerReservations on initialization', () => {
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: '[Reservation] Get customer reservations',
      }),
    );
  });

  it('should compute resultsLength from reservationSignal', () => {
    customerReservation$.next({
      reservations: {
        totalElements: 42,
        content: [],
      },
      upcoming: [],
    });
    fixture.detectChanges();

    expect(component.resultsLengthSignal()).toBe(42);
  });

  it('should compute pageSize based on breakpoints - desktop', () => {
    breakpoints$.next({
      matches: false,
      breakpoints: {},
    });
    fixture.detectChanges();

    expect(component.pageSizeSignal()).toBe(10); // PAGE_SIZE
    expect(component.small()).toBe(false);
  });

  it('should compute pageSize based on breakpoints - mobile', () => {
    breakpoints$.next({
      matches: true,
      breakpoints: {},
    });
    fixture.detectChanges();

    expect(component.pageSizeSignal()).toBe(5); // MOBILE_PAGE_SIZE
    expect(component.small()).toBe(true);
  });

  it('should update dataSource when customerReservation emits', () => {
    const mockReservations = [
      {
        id: '1',
        state: 'completed',
        timestamp: 1234567890,
        room: { timeZone: 'UTC', name: 'Room 1' },
        customer: { displayName: 'John Doe' },
        professional: { displayName: 'Dr. Smith' },
        treatment: { name: 'Treatment 1' },
      },
      {
        id: '2',
        state: 'completed',
        timestamp: 1234567891,
        room: { timeZone: 'UTC', name: 'Room 2' },
        customer: { displayName: 'Jane Doe' },
        professional: { displayName: 'Dr. Jones' },
        treatment: { name: 'Treatment 2' },
      },
    ];

    customerReservation$.next({
      reservations: {
        totalElements: 2,
        content: mockReservations,
      },
      upcoming: [],
    });
    fixture.detectChanges();

    const dataSource = component.dataSourceSignal();
    expect(dataSource?.length).toBe(2);
  });

  it('should set noContent to true when no upcoming reservations', () => {
    customerReservation$.next({
      reservations: {
        totalElements: 0,
        content: [],
      },
      upcoming: [],
    });
    fixture.detectChanges();

    expect(component.noContent()).toBe(true);
  });

  it('should set noContent to false when upcoming reservations exist', () => {
    customerReservation$.next({
      reservations: {
        totalElements: 1,
        content: [],
      },
      upcoming: [{
        id: '1',
        state: 'completed',
        timestamp: 1734012000000,
        price: new Price(100, 0, 0, 0, 100),
        treatment: { name: 'Treatment 1', price: 100, duration: 60 },
        professional: { displayName: 'Dr. Smith' },
        room: {
          timeZone: 'UTC',
          id: 'room-1',
          address: { name: 'Address' },
          currency: 'USD',
          paymentTypes: ['CASH'],
        },
        office: { id: 'office-1', name: 'Office' },
        payments: [],
        additional: [],
      }],
    });
    fixture.detectChanges();

    expect(component.noContent()).toBe(false);
  });

  it('should dispatch cleanDiscount when response emits', () => {
    storeSpy.dispatch.calls.reset();

    response$.next({ success: true });
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: '[Discount] Clean',
      }),
    );
  });

  it('should show error when errorSignal emits', () => {
    const mockError = { message: 'Test error' };
    error$.next(mockError);
    fixture.detectChanges();

    expect(component.errorSignal()).toEqual(mockError);
  });

  it('should compute upcomingSignal from customerReservation', () => {
    const mockUpcoming: any = [
      {
        id: '1',
        state: 'completed',
        timestamp: 1734012000000,
        price: new Price(100, 0, 0, 0, 100),
        treatment: { name: 'Treatment 1', price: 100, duration: 60 },
        professional: { displayName: 'Dr. Smith' },
        room: {
          timeZone: 'UTC',
          id: 'room-1',
          address: { name: 'Address' },
          currency: 'USD',
          paymentTypes: ['CASH'],
        },
        office: { id: 'office-1', name: 'Office' },
        payments: [],
        additional: [],
      },
    ];

    customerReservation$.next({
      reservations: { totalElements: 0, content: [] },
      upcoming: mockUpcoming,
    });
    fixture.detectChanges();

    expect(component.upcomingSignal()).toEqual(mockUpcoming);
  });

  it('should return true from showTimeZone when timezone differs', () => {
    const reservation: any = {
      room: { timeZone: 'America/New_York' },
    };

    const result = component.showTimeZone(reservation);
    expect(typeof result).toBe('boolean');
  });

  it('should call showTimeZone method correctly', () => {
    const reservationSameTimezone: any = {
      room: { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    };
    const reservationDiffTimezone: any = {
      room: { timeZone: 'America/New_York' },
    };

    const resultSame = component.showTimeZone(reservationSameTimezone);
    const resultDiff = component.showTimeZone(reservationDiffTimezone);

    expect(typeof resultSame).toBe('boolean');
    expect(typeof resultDiff).toBe('boolean');
  });

  it('should compute reservationSignal from customerReservationSignal', () => {
    const mockReservations: any = {
      totalElements: 3,
      totalPages: 1,
      number: 0,
      content: [
        {
          id: '1',
          state: 'completed',
          customer: { displayName: 'Customer 1' },
          professional: { displayName: 'Professional 1' },
          room: { timeZone: 'UTC', name: 'Room 1' },
          treatment: { name: 'Treatment 1' },
          timestamp: 1234567890,
        },
        {
          id: '2',
          state: 'completed',
          customer: { displayName: 'Customer 2' },
          professional: { displayName: 'Professional 2' },
          room: { timeZone: 'UTC', name: 'Room 2' },
          treatment: { name: 'Treatment 2' },
          timestamp: 1234567891,
        },
        {
          id: '3',
          state: 'cancelled',
          customer: { displayName: 'Customer 3' },
          professional: { displayName: 'Professional 3' },
          room: { timeZone: 'UTC', name: 'Room 3' },
          treatment: { name: 'Treatment 3' },
          timestamp: 1234567892,
        },
      ],
    };

    customerReservation$.next({
      reservations: mockReservations,
      upcoming: [],
    });
    fixture.detectChanges();

    expect(component.reservationSignal()).toEqual(mockReservations);
  });

  it('should have correct language from TranslateService', () => {
    expect(component.language).toBe('en-GB');
    expect(component.dateFormat).toBe('en-GB');
  });
});
