import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthUserService, IAuthUser, initialAuthUser } from '../services/auth-user.service';
import { signal } from '@angular/core';
import { IDashboard } from './dashboard';
import { ICurrencyAll } from '../currency/currency';
import { getNowTimeZone } from '../util/dates';
import { endOfMonth, startOfMonth } from 'date-fns';
import { States } from '../reservation/reservation';
import { FrequencyEnum } from '../util/helper';
import { provideAppCalendar } from '../util/adapter/app-date.provider';

describe('DashComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  let navigationParams$: BehaviorSubject<any>;
  let dashboardMap$: BehaviorSubject<any>;
  let error$: BehaviorSubject<any>;
  let isLoading$: BehaviorSubject<boolean>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  const mockMiniCardSummaries = [
    { title: 'currency false', isCurrency: false },
    { title: 'currency true', isCurrency: true },
    { title: 'currency with values', isCurrency: true, value: 23, previousPeriodValue: 20 },
  ];

  const mockChartSummaries = [{ title: 'chart' }];

  const currency: ICurrencyAll = {
    id: '1',
    name: 'Test Currency',
    code: 'EUR',
    icon: 'euro',
  };

  const calendarSummaryMock = {
    reservations: [
      {
        reservationId: 'r1',
        title: 'Test reservation',
        start: Date.now() / 1000,
        end: null,
        state: States.completed,
        total: 50,
      },
    ],
    unavailable: [],
    birthdays: [],
    transactions: [],
    notes: [],
  };


  let storeSpy: jasmine.SpyObj<Store<any>>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  beforeEach(async () => {
    navigationParams$ = new BehaviorSubject(undefined);
    dashboardMap$ = new BehaviorSubject(undefined);
    error$ = new BehaviorSubject(undefined);
    isLoading$ = new BehaviorSubject(false);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch', 'select']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser', 'logout'], {
      authUser: authUserSignal.asReadonly(),
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return navigationParams$.asObservable();
        case 2:
          return dashboardMap$.asObservable();
        case 3:
          return error$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });
    storeSpy.select.and.returnValue(isLoading$.asObservable());

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        provideAppCalendar(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    const translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard', () => {
    const roomName = 'Test Room';
    component.getForm.selectedDash.setValue(roomName);
    const record: Record<string, IDashboard> = {};
    record[roomName] = { miniCardSummaries: mockMiniCardSummaries, currency };
    dashboardMap$.next(record);

    fixture.detectChanges();

    expect(component.currency).toBe(currency);

    expect(component.miniCardData.length).toBe(3);
    expect(component.miniCardData[0].isCurrency).toEqual(mockMiniCardSummaries[0].isCurrency);
    expect(component.miniCardData[1].isCurrency).toEqual(mockMiniCardSummaries[1].isCurrency);
    expect(component.miniCardData[2].isCurrency).toEqual(mockMiniCardSummaries[2].isCurrency);
    expect(component.miniCardData[2].value).toEqual('€23.00');
    expect(component.miniCardData[2].previousPeriodValue).toEqual('€20.00');
  });

  it('should load dashboard primary room', () => {
    const roomName = 'Test Room';
    const record: Record<string, IDashboard> = {};
    record[roomName] = { chartSummaries: mockChartSummaries, currency, primary: true };
    dashboardMap$.next(record);

    fixture.detectChanges();

    expect(component.currency).toBe(currency);

    expect(component.charts.length).toBe(1);
    expect(component.charts[0].title).toEqual(mockChartSummaries[0].title);
  });

  it('should set the current date when call closeOpenMonthViewDay on same month', () => {
    const date = getNowTimeZone();
    date.setMonth(date.getMonth(), 10);

    component.closeOpenMonthViewDay(date);

    expect(component.viewDate()).toEqual(date);
  });

  it('should set the 1st day when call closeOpenMonthViewDay on different month', () => {
    const date = getNowTimeZone();
    date.setMonth(date.getMonth() - 10, 10);

    component.closeOpenMonthViewDay(date);

    expect(component.viewDate()).toEqual(startOfMonth(date));
  });

  it('should create calendar events from calendarSummary', () => {
    component.calendarSummary = calendarSummaryMock as any;
    component.timeZone = 'Europe/Amsterdam';

    component['createEvents'](false); // darkMode = false

    const events = component.calendar.calendarEvents;

    expect(events).toBeTruthy();
    expect(events!.length).toBe(1);

    const event = events![0];
    expect(event.title).toBe('Test reservation');
    expect(event.meta.state).toBe(States.completed);
    expect(event.meta.total).toBe(50);
  });

  it('should open active day if event is today', () => {
    const today = getNowTimeZone();

    component.calendarSummary = {
      reservations: [{
        reservationId: 'r1',
        title: 'Today reservation',
        start: today.getTime() / 1000,
        state: States.completed,
      }],
      unavailable: [],
      birthdays: [],
      transactions: [],
      notes: [],
    } as any;

    component['createEvents']();

    expect(component.activeDayIsOpen).toBeTrue();
  });

  it('should create birthday all-day event', () => {
    const today = new Date();

    component.calendarSummary = {
      reservations: [],
      unavailable: [],
      birthdays: [{
        userId: 'u1',
        title: 'Birthday',
        date: today.toDateString(),
      }],
      transactions: [],
      notes: [],
    } as any;

    component['createEvents']();

    expect(component.calendar.calendarEvents.length).toBe(1);

    const event = component.calendar.calendarEvents[0];
    expect(event.allDay).toBeTrue();
    expect(event.meta.state).toBe('BIRTHDAY');
  });

  it('should register recurring note events', () => {
    component.calendarSummary = {
      reservations: [],
      unavailable: [],
      birthdays: [],
      transactions: [],
      notes: [{
        noteId: 'n1',
        title: 'Repeated note',
        date: Date.now() / 1000,
        repeat: FrequencyEnum.everyDay,
      }],
    } as any;

    component['createEvents']();

    // Recurring events are created after execute()
    expect(component.calendar.recurringEvent).toBeTruthy();
  });

  it('should set empty charts and mini card error when no chartSummaries and miniCardSummaries', () => {
    const roomName = 'RoomWithoutContent';

    const record: Record<string, IDashboard> = {};
    record[roomName] = {
      currency,
      roomId: 'r1',
      professionalId: 'p1',
      calendarSummary: calendarSummaryMock as any,
      chartSummaries: undefined,
      miniCardSummaries: undefined,
    };

    component.getForm.selectedDash.setValue(roomName);

    dashboardMap$.next(record);
    fixture.detectChanges();

    expect(component.charts.length).toBe(0);
    expect(component.miniCardData.length).toBe(4);
    component.miniCardData.forEach(card => {
      expect(card.error?.status).toBe('NO_CONTENT');
    });

    expect(component.miniCardData.length).toBe(4);

    component.miniCardData.forEach(card => {
      expect(card.error).toBeTruthy();
      expect(card.error?.status).toBe('NO_CONTENT');
      expect(card.title).toContain('DASHBOARD.MINI_CARD');
    });
  });

  it('should ignore BLOCK_AGENDA unavailable events', () => {
    component.calendarSummary = {
      unavailable: [
        {
          type: 'BLOCK_AGENDA',
          start: new Date().toISOString(),
        },
      ],
      reservations: [],
      birthdays: [],
      transactions: [],
      notes: [],
    } as any;

    component['createEvents'](false);

    expect(component.calendar.calendarEvents.length).toBe(0);
  });

  it('should create event for non-repeating unavailable', () => {
    component.calendarSummary = {
      unavailable: [
        {
          type: 'UNAVAILABLE',
          start: new Date().toISOString(),
          duration: 60,
          title: 'Vacation',
          unavailableId: 'u1',
          repeat: FrequencyEnum.none,
        },
      ],
      reservations: [],
      birthdays: [],
      transactions: [],
      notes: [],
    } as any;

    component['createEvents'](false);

    const events = component.calendar.calendarEvents;

    expect(events.length).toBe(1);
    expect(events[0].title).toContain('Vacation');
    expect(events[0].meta.state).toBe('UNAVAILABLE');
  });

  it('should register recurring unavailable event', () => {
    component.calendarSummary = {
      unavailable: [
        {
          type: 'UNAVAILABLE',
          start: new Date().toISOString(),
          title: 'Weekly off',
          unavailableId: 'u2',
          repeat: FrequencyEnum.onceAWeek,
          duration: undefined,
          allDay: true,
        },
      ],
      reservations: [],
      birthdays: [],
      transactions: [],
      notes: [],
    } as any;

    component['createEvents'](false);

    const events = component.calendar.calendarEvents;

    expect(events.length).toBeGreaterThan(0);
    expect(events.some(e => e.meta.state === 'UNAVAILABLE')).toBeTrue();
  });

  it('should set activeDayIsOpen when unavailable is today', () => {
    const today = new Date();

    component.activeDayIsOpen = false;
    component.calendarSummary = {
      unavailable: [
        {
          type: 'UNAVAILABLE',
          start: today.toISOString(),
          title: 'Today off',
          unavailableId: 'u3',
          repeat: FrequencyEnum.none,
        },
      ],
      reservations: [],
      birthdays: [],
      transactions: [],
      notes: [],
    } as any;

    component['createEvents'](false);

    expect(component.activeDayIsOpen).toBeTrue();
  });

  it('should create transaction all-day event', () => {
    const now = new Date();

    component.calendarSummary = {
      transactions: [
        {
          title: 'Payment received',
          createdAt: now.toISOString(),
          accountId: 'acc-1',
          transactionId: 'tx-123',
          total: 150,
        },
      ],
      unavailable: [],
      reservations: [],
      birthdays: [],
      notes: [],
    } as any;

    component['createEvents'](false);

    const events = component.calendar.calendarEvents;

    expect(events.length).toBe(1);

    const event = events[0];

    expect(event.title).toBe('Payment received');
    expect(event.meta.state).toBe('TRANSACTION');
    expect(event.meta.total).toBe(150);

    // all-day events have same start & end day
    expect(event.allDay).toBeTrue();

    // year normalized to current year
    expect(event.start.getFullYear()).toBe(getNowTimeZone().getFullYear());

    // route correctness
    expect(event.meta.route.join('/')).toContain('accounts/acc-1/transactions/tx-123');
  });

  it('should create multiple transaction events', () => {
    component.calendarSummary = {
      transactions: [
        { title: 'T1', createdAt: new Date().toISOString(), accountId: 'a1', transactionId: 't1', total: 10 },
        { title: 'T2', createdAt: new Date().toISOString(), accountId: 'a2', transactionId: 't2', total: 20 },
      ],
      unavailable: [],
      reservations: [],
      birthdays: [],
      notes: [],
    } as any;

    component['createEvents'](false);

    expect(component.calendar.calendarEvents.length).toBe(2);
  });

  it('should create note event when repeat is none', () => {
    const date = new Date();

    component.calendarSummary = {
      reservations: [],
      unavailable: [],
      birthdays: [],
      transactions: [],
      notes: [
        {
          noteId: 'n1',
          title: 'Single note',
          date: date.toISOString(),
          repeat: FrequencyEnum.none,
        },
      ],
    } as any;

    component['createEvents'](false);

    const events = component.calendar.calendarEvents;

    expect(events.length).toBe(1);

    const event = events[0];

    expect(event.title).toBe('Single note');
    expect(event.allDay).toBeTrue();
    expect(event.meta.state).toBe('NOTE');
    expect(event.meta.route.join('/')).toContain('notes/n1');
  });

  it('should register non recurring note and create event()', () => {
    const start = new Date();
    start.setDate(5);

    // Simulate calendar month boundaries
    component.calendar.calendarStart = new Date(start.getFullYear(), start.getMonth(), 1);
    component.calendar.calendarEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0);

    component.calendarSummary = {
      reservations: [],
      unavailable: [],
      birthdays: [],
      transactions: [],
      notes: [
        {
          noteId: 'n-rec',
          title: 'Non recurring note',
          date: start.toISOString(),
          repeat: FrequencyEnum.none,
        },
      ],
    } as any;

    component['createEvents'](false);

    // After createEvents, recurring events are executed
    const events = component.calendar.calendarEvents;

    expect(events.length).toBeGreaterThan(0);

    const event = events[0];
    expect(event.title).toBe('Non recurring note');
    expect(event.meta.state).toBe('NOTE');
    expect(event.allDay).toBeTrue();
  });

  it('should register recurring note and create events after execute()', () => {
    const start = new Date();

    // Simulate calendar month boundaries
    component.calendar.calendarStart = startOfMonth(start);
    component.calendar.calendarEnd = endOfMonth(start);

    const noteDate = new Date();
    noteDate.setFullYear(start.getFullYear(), start.getMonth() -1, 25);

    component.calendarSummary = {
      reservations: [],
      unavailable: [],
      birthdays: [],
      transactions: [],
      notes: [
        {
          noteId: 'n-rec',
          title: 'Recurring note',
          date: noteDate.toISOString(),
          repeat: FrequencyEnum.everyDay,
        },
      ],
    } as any;

    component['createEvents'](false);

    // After createEvents, recurring events are executed
    const events = component.calendar.calendarEvents;

    expect(events.length).toBeGreaterThan(0);

    const event = events[0];
    expect(event.title).toBe('Recurring note');
    expect(event.meta.state).toBe('NOTE');
    expect(event.allDay).toBeTrue();
  });

  it('Should change to dark mode', () => {
    authUserSignal.update(prev => ({
      ...prev,
      isDarkMode: true,
    }));
    fixture.detectChanges();
    expect(component['isDarkMode']()).toBeTrue();
  });

  it('Should change to light mode', () => {
    authUserSignal.update(prev => ({
      ...prev,
      isDarkMode: false,
    }));
    fixture.detectChanges();
    expect(component['isDarkMode']()).toBeFalse();
  });
});
