import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarComponent } from './calendar.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { getAllGroupingByRoom, updateReservationTimestamp } from '../../store/reservation.actions';
import { CalendarEvent } from 'angular-calendar';
import { addDays, addMonths } from 'date-fns';
import { ReservationState } from '../../store/reducers/reservation.reducers';
import { Role } from '../../interfaces/token';
import { IOfficeAll } from '../../interfaces/office';
import { IRoomAll } from '../../interfaces/room';
import { ICurrencyAll } from '../../interfaces/currency';
import { IUserAll } from '../../interfaces/user';
import { States } from '../../interfaces/reservation';
import { createNewDate } from '../../util/dates';
import { signal } from '@angular/core';
import { provideAppCalendar, provideAppDateAdapter } from '../../util/adapter/app-date.provider';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  let storeSpy: jasmine.SpyObj<Store<ReservationState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  let rooms$: BehaviorSubject<any>;
  let calendar$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  const mockOffice1: IOfficeAll = {
    manager: {
      id: 'manager-1',
      displayName: 'Manager 1',
    },
    id: 'office-1',
    name: 'Office 1',
  };

  const mockOffice2: IOfficeAll = {
    manager: {
      id: 'manager-2',
      displayName: 'Manager 2',
    },
    id: 'office-2',
    name: 'Office 2',
  };

  const mockCurrency: ICurrencyAll = {
    code: 'EUR',
    icon: 'Euro',
    id: 'currency-1',
    name: 'Euro',
  };

  const mockProfessional1: IUserAll = {
    id: 'prof-1', displayName: 'Professional 1',
    email: 'professional1@test.com',
    authorities: [],
    locale: 'en',
    timeZone: 'Europe/Amsterdam',
  };

  const mockProfessional2: IUserAll = {
    id: 'prof-2', displayName: 'Professional 2',
    email: 'professional2@test.com',
    authorities: [],
    locale: 'en',
    timeZone: 'Europe/Amsterdam',
  };

  const mockRoom1: IRoomAll = {
    currency: mockCurrency,
    paymentTypes: [],
    primary: true,
    id: 'room-1',
    address: { id: 1, name: 'Room 1', location: { x: 1, y: 2 } },
    timeZone: 'Europe/Amsterdam',
    availabilities: [
      { day: 'MONDAY', start: '09:00', end: '17:00' },
      { day: 'TUESDAY', start: '09:00', end: '17:00' },
      { day: 'WEDNESDAY', start: '09:00', end: '17:00' },
      { day: 'THURSDAY', start: '09:00', end: '17:00' },
      { day: 'FRIDAY', start: '09:00', end: '17:00' },
    ],
    professionals: [mockProfessional1, mockProfessional2],
    office: mockOffice1,
  };

  const mockRoom2 = {
    currency: mockCurrency,
    paymentTypes: [],
    primary: true,
    id: 'room-2',
    address: { id: 2, name: 'Room 2', location: { x: 2, y: 2 } },
    timeZone: 'Europe/Amsterdam',
    availabilities: [
      { day: 'MONDAY', start: '09:00', end: '17:00' },
      { day: 'TUESDAY', start: '09:00', end: '17:00' },
      { day: 'WEDNESDAY', start: '09:00', end: '17:00' },
      { day: 'THURSDAY', start: '09:00', end: '17:00' },
      { day: 'FRIDAY', start: '09:00', end: '17:00' },
    ],
    professionals: [mockProfessional1],
    office: mockOffice2,
  };

  const mockCalendarData = {
    room: mockRoom1,
    reservations: [],
    unavailableList: [],
    birthdays: [],
    notes: [],
  };

  beforeEach(async () => {
    authUserSignal.update(prev => ({
      ...prev,
      isDarkMode: false,
      professionalId: 'professional-id',
      isRoomAdmin: false,
    }));
    rooms$ = new BehaviorSubject(undefined);
    calendar$ = new BehaviorSubject([mockCalendarData]);
    breakpoint$ = new BehaviorSubject({
      matches: false,
      breakpoints: {},
    });

    storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'pipe']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return rooms$.asObservable();
        case 2:
          return calendar$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [CalendarComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        provideAppDateAdapter(),
        provideAppCalendar(),
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    rooms$.complete();
    calendar$.complete();
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize form with correct controls', () => {
      expect(component.form.controls.office).toBeDefined();
      expect(component.form.controls.room).toBeDefined();
      expect(component.form.controls.professional).toBeDefined();
    });

    it('should set office control as required', () => {
      expect(component.getForm.office.hasError('required')).toBe(true);
    });

    it('should set room control as required', () => {
      expect(component.getForm.room.hasError('required')).toBe(true);
    });

    it('should initialize viewDate signal with current date', () => {
      expect(component.viewDate()).toBeDefined();
    });

    it('should initialize calendar with default values', () => {
      expect(component.calendar).toBeDefined();
    });

    it('should set locale from translate service', () => {
      expect(component.locale).toBe('en-GB');
      expect(component.language).toBe('en-GB');
    });
  });

  describe('Computed Signals', () => {
    it('should compute isDarkMode from authUser', () => {
      authUserSignal.update(prev => ({ ...prev, isDarkMode: true, professionalId: 'prof-1', isRoomAdmin: false }));
      fixture.detectChanges();
      expect(component.isDarkMode()).toBe(true);

      authUserSignal.update(prev => ({ ...prev, isDarkMode: false, professionalId: 'prof-1', isRoomAdmin: false }));
      fixture.detectChanges();
      expect(component.isDarkMode()).toBe(false);
    });

    it('should compute isRoomAdmin from authUser', () => {
      authUserSignal.update(prev => ({ ...prev, isDarkMode: false, professionalId: 'prof-1', isRoomAdmin: true }));
      fixture.detectChanges();
      expect(component['isRoomAdmin']()).toBe(true);

      authUserSignal.update(prev => ({ ...prev, isDarkMode: false, professionalId: 'prof-1', isRoomAdmin: false }));
      fixture.detectChanges();
      expect(component['isRoomAdmin']()).toBe(false);
    });

    it('should compute offices from rooms', () => {
      rooms$.next([mockRoom1, mockRoom2]);
      fixture.detectChanges();

      const offices = component.offices();

      expect(offices.length).toBe(2);
      expect(offices[0].name).toBe('Office 1');
      expect(offices[1].name).toBe('Office 2');
    });

    it('should compute daysInWeekSignal based on breakpoints', () => {
      breakpoint$.next({
        matches: true,
        breakpoints: { '(max-width: 576px)': true },
      });
      fixture.detectChanges();
      expect(component.daysInWeekSignal()).toBe(1);

      breakpoint$.next({
        matches: true,
        breakpoints: { '(max-width: 768px)': true },
      });
      fixture.detectChanges();
      expect(component.daysInWeekSignal()).toBe(2);

      breakpoint$.next({
        matches: false,
        breakpoints: {},
      });
      fixture.detectChanges();
      expect(component.daysInWeekSignal()).toBe(7);
    });
  });

  describe('Form Auto-selection', () => {
    it('should auto-select office when only one office exists', () => {
      rooms$.next([mockRoom1]);
      fixture.detectChanges();
      expect(component.getForm.office.value?.id).toEqual(mockRoom1.office?.id);
    });

    it('should auto-select room when office has only one room', () => {
      rooms$.next([mockRoom1, mockRoom2]);
      fixture.detectChanges();

      component.getForm.office.setValue(component.offices()[0]);
      fixture.detectChanges();
      expect(component.getForm.room.value?.id).toEqual(mockRoom1?.id);
    });

    it('should auto-select professional when room has only one professional', () => {
      rooms$.next([mockRoom2]);
      fixture.detectChanges();
      expect(component.getForm.professional.value).toEqual(mockProfessional1);
    });
  });

  describe('Display Functions', () => {
    it('should display office name', () => {
      const result = component.displayFnOffice(mockOffice1 as any);
      expect(result).toBe('Office 1');
    });

    it('should display empty string for undefined office', () => {
      const result = component.displayFnOffice(undefined as any);
      expect(result).toBe('');
    });

    it('should display room address name', () => {
      const result = component.displayFnRoom(mockRoom1);
      expect(result).toBe('Room 1');
    });

    it('should display professional display name', () => {
      const result = component.displayFnProfessional(mockRoom1.professionals![0]);
      expect(result).toBe('Professional 1');
    });

    it('should display empty string for undefined professional', () => {
      const result = component.displayFnProfessional(undefined as any);
      expect(result).toBe('');
    });
  });

  describe('Keyboard Handlers', () => {
    it('should clear form control on Backspace', () => {
      const formControl = component.getForm.office;
      formControl.setValue(mockOffice1);
      const event = new KeyboardEvent('keydown', { code: 'Backspace' });

      component.keyDownHandler(event, formControl);

      expect(formControl.value).toBeUndefined();
    });

    it('should clear office and room on keyDownOffice Backspace', () => {
      component.getForm.office.setValue(mockOffice1);
      component.getForm.room.setValue(mockRoom1);
      const event = new KeyboardEvent('keydown', { code: 'Backspace' });

      component.keyDownOffice(event);

      expect(component.getForm.office.value).toBeUndefined();
      expect(component.getForm.room.value).toBeUndefined();
    });

    it('should clear room and professional on keyDownRoom Backspace', () => {
      component.getForm.room.setValue(mockRoom1);
      component.getForm.professional.setValue(mockProfessional1);
      const event = new KeyboardEvent('keydown', { code: 'Backspace' });

      component.keyDownRoom(event);

      expect(component.getForm.room.value).toBeUndefined();
      expect(component.getForm.professional.value).toBeUndefined();
    });
  });

  describe('Date Operations', () => {
    it('should have totalDays as 0 for full week (7 days)', () => {
      breakpoint$.next({ matches: false, breakpoints: {} });
      fixture.detectChanges();
      expect(component.totalDays).toBe(0);
    });

    it('should have totalDays equal to daysInWeek for partial week', () => {
      breakpoint$.next({
        matches: true,
        breakpoints: { '(max-width: 576px)': true },
      });
      fixture.detectChanges();
      expect(component.totalDays).toBe(1);
    });

    it('should increment date when increment is called', () => {
      const newDate = addDays(createNewDate(new Date()), 10);
      component.selectDate({ value: newDate });

      fixture.detectChanges();
      component.increment();

      expect(createNewDate(component.viewDate())).toEqual(addDays(newDate, 7));
    });

    it('should decrement date when decrement is called', () => {
      const newDate = addDays(createNewDate(new Date()), 10);
      component.selectDate({ value: newDate });

      fixture.detectChanges();

      component.decrement();

      expect(createNewDate(component.viewDate())).toEqual(addDays(newDate, -7));
    });

    it('should update viewDate on selectDate', () => {
      const newDate = new Date(2024, 5, 15);
      component.getForm.office.setValue(mockOffice1);
      component.getForm.room.setValue(mockRoom1);

      component.selectDate({ value: newDate });

      expect(component.viewDate().getDate()).toBe(newDate.getDate());
      expect(component.viewDate().getMonth()).toBe(newDate.getMonth());
    });
  });

  describe('Event Handlers', () => {
    it('should navigate to reservation when view is called with valid event', () => {
      const event: CalendarEvent = {
        id: 'reservation-123',
        start: new Date(),
        title: 'Test Event',
      };

      component.view(event);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['reservation-123']);
    });

    it('should not navigate when event id is OUT_OF_WORK_ALL_DAY', () => {
      const event: CalendarEvent = {
        id: 'OUT_OF_WORK_ALL_DAY',
        start: new Date(),
        title: 'Out of Work',
      };

      component.view(event);

      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should not navigate when event id is OUT_OF_WORK', () => {
      const event: CalendarEvent = {
        id: 'OUT_OF_WORK',
        start: new Date(),
        title: 'Out of Work',
      };

      component.view(event);

      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should not navigate when event id is LUNCH', () => {
      const event: CalendarEvent = {
        id: 'LUNCH',
        start: new Date(),
        title: 'Lunch',
      };

      component.view(event);

      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should open dialog on segmentClick when date is valid', () => {
      rooms$.next([mockRoom1]);
      fixture.detectChanges();

      component.getForm.room.setValue(mockRoom1);
      const futureDate = addDays(new Date(), 5);

      dialogSpy.open.and.returnValue({
        afterClosed: () => of('en,reservation,new'),
      } as any);

      component.segmentClick(futureDate, mockRoom1);

      expect(dialogSpy.open).toHaveBeenCalled();
    });
  });

  describe('Filter Methods', () => {
    it('should filter offices by name', () => {
      const offices = [mockOffice1, mockOffice2];
      const filtered = component['filterOffice']('Office 1', offices);

      expect(filtered?.length).toBe(1);
      expect(filtered?.[0].name).toBe('Office 1');
    });

    it('should filter offices case-insensitively', () => {
      const offices = [mockOffice1, mockOffice2];
      const filtered = component['filterOffice']('office 2', offices as any);

      expect(filtered?.length).toBe(1);
      expect(filtered?.[0].name).toBe('Office 2');
    });

    it('should filter rooms by address name', () => {
      const filtered = component['filterRoom']('Room 1', [mockRoom1, mockRoom2]);

      expect(filtered?.length).toBe(1);
      expect(filtered?.[0].address.name).toBe('Room 1');
    });

    it('should filter professionals by display name', () => {
      const professionals = mockRoom1.professionals;
      const filtered = component['filterProfessional']('Professional 1', professionals);

      expect(filtered?.length).toBe(1);
      expect(filtered?.[0].displayName).toBe('Professional 1');
    });

    it('should return undefined when filtering undefined offices', () => {
      const filtered = component['filterOffice']('test', undefined);
      expect(filtered).toBeUndefined();
    });
  });

  describe('Store Dispatching', () => {
    it('should dispatch getAllGroupingByRoom on room selection', () => {
      rooms$.next([mockRoom1, mockRoom2]);
      component.getForm.office.setValue(component.offices()[0]);
      component.getForm.room.setValue(mockRoom1);
      fixture.detectChanges();

      expect(storeSpy.dispatch).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: getAllGroupingByRoom.type,
        }),
      );
    });

    it('should dispatch updateReservationTimestamp when event times changed is confirmed', () => {
      rooms$.next([mockRoom1]);
      fixture.detectChanges();
      dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);

      const oldStart = new Date(2024, 5, 15, 10, 0);
      const newStart = new Date(2024, 5, 15, 11, 0);
      const newEnd = new Date(2024, 5, 15, 12, 0);

      const event: CalendarEvent = {
        id: 'reservation-123',
        start: oldStart,
        end: new Date(2024, 5, 15, 11, 0),
        title: 'Test Event',
        meta: {
          id: 'reservation-123',
          customer: 'John Doe',
          timeZone: 'Europe/Amsterdam',
        },
      };

      component.eventTimesChanged({ event, newStart, newEnd, type: '' } as any);

      expect(dialogSpy.open).toHaveBeenCalled();
      expect(storeSpy.dispatch).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: updateReservationTimestamp.type,
        }),
      );
    });

    it('should revert event times when eventTimesChanged is cancelled', () => {
      rooms$.next([mockRoom1]);
      fixture.detectChanges();
      dialogSpy.open.and.returnValue({ afterClosed: () => of(false) } as any);

      const oldStart = new Date(2024, 5, 15, 10, 0);
      const oldEnd = new Date(2024, 5, 15, 11, 0);
      const newStart = new Date(2024, 5, 15, 11, 0);
      const newEnd = new Date(2024, 5, 15, 12, 0);

      const event: CalendarEvent = {
        id: 'reservation-123',
        start: oldStart,
        end: oldEnd,
        title: 'Test Event',
        meta: {
          id: 'reservation-123',
          customer: 'John Doe',
          timeZone: 'Europe/Amsterdam',
        },
      };

      component.eventTimesChanged({ event, newStart, newEnd, type: '' } as any);

      expect(event.start).toEqual(oldStart);
      expect(event.end).toEqual(oldEnd);
    });

    it('should not trigger eventTimesChanged when start date is the same', () => {
      const start = new Date(2024, 5, 15, 10, 0);
      dialogSpy.open.and.returnValue({ afterClosed: () => of(false) } as any);
      const event: CalendarEvent = {
        id: 'reservation-123',
        start: start,
        end: new Date(2024, 5, 15, 11, 0),
        title: 'Test Event',
        meta: {},
      };

      component.eventTimesChanged({ event, newStart: start, newEnd: new Date(2024, 5, 15, 11, 0), type: '' } as any);

      expect(dialogSpy.open).not.toHaveBeenCalled();
    });
  });

  describe('Calendar Month View Render', () => {
    it('should set calendar start and end dates on beforeMonthViewRender', () => {
      const period = {
        start: new Date(2024, 5, 1),
        end: new Date(2024, 5, 30),
      };
      const header: any[] = [];

      component.beforeMonthViewRender({ header, period });

      expect(component.calendar.calendarStart).toEqual(period.start);
      expect(component.calendar.calendarEnd).toEqual(period.end);
    });

    it('should add cal-disabled class to invalid dates in header', () => {
      const pastDate = new Date(2020, 0, 1);
      const futureDate = addMonths(new Date(), 50);
      const validDate = addDays(new Date(), 5);

      const header = [
        { date: pastDate, cssClass: '' },
        { date: futureDate, cssClass: '' },
        { date: validDate, cssClass: '' },
      ];
      const period = {
        start: new Date(2024, 5, 1),
        end: new Date(2024, 5, 30),
      };

      component.beforeMonthViewRender({ header, period });

      expect(header[0].cssClass).toBe('cal-disabled');
      expect(header[1].cssClass).toBe('cal-disabled');
      expect(header[2].cssClass).toBe('');
    });
  });

  it('should include reservation meta details when creating calendar reservation events', () => {
    const reservation = {
      id: 'reservation-1',
      timestamp: new Date(2026, 4, 6, 13, 30).getTime() / 1000,
      state: States.approved,
      customer: { displayName: 'Customer 1' },
      professional: { displayName: 'Professional 1' },
      room: { timeZone: 'Europe/Amsterdam' },
      treatment: { name: 'Treatment 1', duration: 'PT30M' },
      additional: [{ name: 'Additional 1' }],
      showNotification: true,
    } as any;

    const events = component['addReservations']({ reservations: [reservation] } as any, false);

    expect(events[0].meta.professionalName).toBe('Professional 1');
    expect(events[0].meta.isReservation).toBeTrue();
    expect(events[0].meta.treatmentName).toBe('Treatment 1');
    expect(events[0].meta.additionalNames).toEqual(['Additional 1']);
    expect(events[0].cssClass).toContain('approved');
  });

  describe('Max and Min Dates', () => {
    it('should set maxDate to MAX_RESERVATION_MONTH months in the future', () => {
      expect(component.maxDate).toBeDefined();
      expect(component.maxDate.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it('should set minDate to January 1, 2023', () => {
      expect(component.minDate).toEqual(new Date(2023, 0, 1));
    });
  });

  describe('Role-based behavior', () => {
    it('should dispatch with roomAdmin role when user is room admin', () => {
      rooms$.next([mockRoom1]);
      fixture.detectChanges();
      authUserSignal.update(prev => ({ ...prev, isDarkMode: false, professionalId: 'prof-1', isRoomAdmin: true }));
      fixture.detectChanges();

      dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);

      const event: CalendarEvent = {
        id: 'reservation-123',
        start: new Date(2024, 5, 15, 10, 0),
        end: new Date(2024, 5, 15, 11, 0),
        title: 'Test Event',
        meta: {
          id: 'reservation-123',
          customer: 'John Doe',
          timeZone: 'Europe/Amsterdam',
        },
      };

      component.eventTimesChanged({
        event,
        newStart: new Date(2024, 5, 15, 11, 0),
        newEnd: new Date(2024, 5, 15, 12, 0),
        type: '',
      } as any);

      expect(storeSpy.dispatch).toHaveBeenCalledWith(
        jasmine.objectContaining({
          role: Role.roomAdmin,
        }),
      );
    });

    it('should dispatch with professional role when user is not room admin', () => {
      rooms$.next([mockRoom1]);
      fixture.detectChanges();
      authUserSignal.update(prev => ({ ...prev, isDarkMode: false, professionalId: 'prof-1', isRoomAdmin: false }));
      fixture.detectChanges();

      dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);

      const event: CalendarEvent = {
        id: 'reservation-123',
        start: new Date(2024, 5, 15, 10, 0),
        end: new Date(2024, 5, 15, 11, 0),
        title: 'Test Event',
        meta: {
          id: 'reservation-123',
          customer: 'John Doe',
          timeZone: 'Europe/Amsterdam',
        },
      };

      component.eventTimesChanged({
        event,
        newStart: new Date(2024, 5, 15, 11, 0),
        newEnd: new Date(2024, 5, 15, 12, 0),
        type: '',
      } as any);

      expect(storeSpy.dispatch).toHaveBeenCalledWith(
        jasmine.objectContaining({
          role: Role.professional,
        }),
      );
    });
  });
});
