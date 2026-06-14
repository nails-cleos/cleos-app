import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardEventComponent } from './dashboard-event.component';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { DayViewSchedulerCalendarUtils, Professional } from './day-view-scheduler.component';
import { IProfessionalEvent, IRoomEvents } from '../dashboard';
import { addDays, addHours } from 'date-fns';
import { States } from '../../reservation/reservation';
import { FrequencyEnum } from '../../util/helper';
import { daysOfWeek, DEFAULT_LOCALE } from '../../util/dates';
import { DashboardState } from '../../store/reducers/dashboard.reducers';
import { signal } from '@angular/core';
import { approveReservation, startReservation } from '../../store/actions/reservation.actions';
import { provideAppCalendar, provideAppDateAdapter } from '../../util/adapter/app-date.provider';

describe('DashboardEventComponent', () => {
  let fixture: ComponentFixture<DashboardEventComponent>;
  let component: DashboardEventComponent;

  let eventDashboard$: BehaviorSubject<any>;
  let navigationParams$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let dialogSpy: jasmine.Spy<any>;
  let routerSpy: jasmine.SpyObj<Router>;
  let storeSpy: jasmine.SpyObj<Store<DashboardState>>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  beforeEach(async () => {
    navigationParams$ = new BehaviorSubject(undefined);
    eventDashboard$ = new BehaviorSubject(undefined);

    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'currentNavigation']);
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
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
          return eventDashboard$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [DashboardEventComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        DayViewSchedulerCalendarUtils,
        provideAppDateAdapter(),
        provideAppCalendar(),
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture = TestBed.createComponent(DashboardEventComponent);
    component = fixture.componentInstance;

    dialogSpy = spyOn(component['dialog'], 'open');

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    navigationParams$.complete();
    eventDashboard$.complete();
  });

  it('should dispatch Clean and GetMyEvent on init', () => {
    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.anything()); // Clean
    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.anything()); // GetMyEvent
  });

  it('should update professional reservations on professionalChanged', () => {
    const prof: Professional = new Professional('p1', 'Prof 1', 'img1.png', { primary: '#000', secondary: '#fff' });
    prof.reservations = 1;
    prof.time = 60;

    const newProf: Professional = new Professional('p2', 'Prof 2', 'img2.png', { primary: '#111', secondary: '#eee' });

    component.professionals = [prof, newProf];

    const event = {
      id: 'e1',
      start: new Date(2025, 8, 23, 10, 0),
      end: new Date(2025, 8, 23, 11, 0),
      meta: { professional: prof },
    };

    component.professionalChanged({ event, newProfessional: newProf });

    expect(prof.reservations).toBe(0);
    expect(newProf.reservations).toBe(1);
    expect(event.meta.professional).toBe(newProf);
  });

  it('should decorate event title if state is started', () => {
    const event: any = {
      id: '1',
      title: '<b>Test</b>',
      start: new Date(),
      end: new Date(new Date().getTime() + 60000),
      meta: { state: 'STARTED', started: new Date() },
    };
    const result = component['createTitle'](event);
    expect(result.title).toContain('timing');
  });

  it('should return the original event for non-reservation states', () => {
    const event: any = {
      id: '1',
      title: 'Plain title',
      start: new Date(),
      meta: { state: 'NOTE' },
    };

    const result = component['createTitle'](event);

    expect(result).toBe(event);
    expect(result.title).toBe('Plain title');
  });

  it('should render completed reservation card with actual time, total and duration badges', () => {
    const event: any = {
      id: '1',
      title: '<b>Valerie Merien</b>',
      start: new Date(2026, 3, 24, 8, 0),
      end: new Date(2026, 3, 24, 9, 30),
      meta: {
        state: States.completed,
        started: new Date(2026, 3, 24, 8, 0),
        finished: new Date(2026, 3, 24, 9, 30),
        durationSeconds: 90 * 60,
        total: 75,
        currency: 'EUR',
      },
    };

    const result = component['createTitle'](event);

    expect(result.title).toContain('08:00 - 09:30');
    expect(result.title).toContain('€ 75.00');
    expect(result.title).toContain('1h 30 min.');
    expect(result.title).toContain('COMPLETED');
  });

  it('should render reservation card body and total badge when customer and total are present', () => {
    const event: any = {
      id: '1',
      title: '<b>Valerie Merien</b>',
      start: new Date(2026, 3, 24, 8, 0),
      end: new Date(2026, 3, 24, 9, 0),
      meta: {
        state: States.approved,
        customer: 'Late Customer',
        total: 50,
        currency: 'EUR',
      },
    };

    const result = component['createTitle'](event);

    expect(result.title).toContain('dashboard-reservation-card__body');
    expect(result.title).toContain('<b>Valerie Merien</b>');
    expect(result.title).toContain('€ 50.00');
  });

  it('should keep expected finish for started reservations and hide finish in when scheduled end is in the past', () => {
    const startedAt = new Date();
    startedAt.setHours(10, 20, 0, 0);
    const scheduledStart = new Date(startedAt);
    scheduledStart.setHours(10, 0, 0, 0);
    const scheduledEnd = new Date(startedAt);
    scheduledEnd.setHours(11, 0, 0, 0);
    const now = new Date(startedAt);
    now.setHours(11, 30, 0, 0);

    const event: any = {
      id: '1',
      title: '<b>Late Customer</b>',
      start: scheduledStart,
      end: scheduledEnd,
      meta: {
        state: States.started,
        started: startedAt,
      },
    };

    const result = component['createTitle'](event, now);

    expect(result.title).toContain('id="elapsed">1h 10 min.');
    expect(result.title).not.toContain('Elapsed +');
    expect(result.title).toContain('id="projected-finish">11:20');
    expect(result.title).not.toContain('Finish in');
    expect(result.title).not.toContain('id="finish"');
  });

  it('should show early start and finish-in details for started reservations still in progress', () => {
    const startedAt = new Date();
    startedAt.setHours(9, 50, 0, 0);
    const scheduledStart = new Date(startedAt);
    scheduledStart.setHours(10, 0, 0, 0);
    const scheduledEnd = new Date(startedAt);
    scheduledEnd.setHours(11, 0, 0, 0);
    const now = new Date(startedAt);
    now.setHours(10, 20, 0, 0);

    const event: any = {
      id: '1',
      title: '<b>Early Customer</b>',
      start: scheduledStart,
      end: scheduledEnd,
      meta: {
        state: States.started,
        started: startedAt,
      },
    };

    const result = component['createTitle'](event, now);

    expect(result.title).toContain('id="start">-10 min.');
    expect(result.title).toContain('Finish in');
    expect(result.title).toContain('id="finish">-40 min.');
  });

  it('should return base64 image if image is present', () => {
    const prof: IProfessionalEvent = {
      calendarSummary: {
        reservations: [],
        unavailable: [],
        birthdays: [],
        notes: [],
        transactions: [],
      },
      id: '1',
      image: 'abc123',
      name: 'prof',
    };
    const url = DashboardEventComponent['getProfessionalImage'](prof);
    expect(url).toBe('data:image/jpg;base64,abc123');
  });

  it('should return http image if imageUrl is present', () => {
    const prof: IProfessionalEvent = {
      calendarSummary: {
        reservations: [],
        unavailable: [],
        birthdays: [],
        notes: [],
        transactions: [],
      },
      id: '1',
      imageUrl: 'http://abc123.png',
      name: 'prof',
    };
    const url = DashboardEventComponent['getProfessionalImage'](prof);
    expect(url).toBe('http://abc123.png');
  });

  it('should return default image if imageUrl is not present', () => {
    const prof: IProfessionalEvent = {
      calendarSummary: {
        reservations: [],
        unavailable: [],
        birthdays: [],
        notes: [],
        transactions: [],
      },
      id: '1',
      name: 'prof',
    };
    const url = DashboardEventComponent['getProfessionalImage'](prof);
    expect(url).toBe('assets/icons/icon-512x512.png');
  });

  it('should add the events to the calendar', () => {
    const now = new Date();
    now.setHours(11, 0);
    const dashboard: IRoomEvents = {
      roomId: 'r1',
      roomName: 'Room 1',
      timeZone: 'Europe/Amsterdam',
      currencyCode: 'EUR',
      availability: { day: daysOfWeek[now.getDay()], start: '09:00', end: '17:00' },
      professionals: [
        {
          id: 'e1',
          name: 'event 1',
          calendarSummary: {
            reservations: [
              {
                title: 'Reservation 1',
                start: addHours(now, -1).getTime() / 1000,
                reservationId: 'r1',
                customerId: 'c1',
                started: addHours(now, -1).getTime() / 1000,
                end: now.getTime() / 1000,
                state: States.completed,
                total: 130,
              },
            ],
            unavailable: [
              {
                unavailableId: 'u1',
                title: 'Unavailable 1',
                start: addDays(now, -3).getTime() / 1000,
                end: addDays(now, -2).toDateString(),
                repeat: FrequencyEnum.everyDay,
                allDay: true,
                type: 'UNAVAILABLE',
              },
              {
                unavailableId: 'u2',
                title: 'Unavailable 2',
                start: addHours(now, 1).getTime() / 1000,
                end: addHours(now, 2).toDateString(),
                repeat: FrequencyEnum.none,
                duration: 'PT1H',
                allDay: false,
                type: 'BLOCK_AGENDA',
              },
              {
                unavailableId: 'u3',
                title: 'Unavailable 3',
                start: addDays(now, -3).getTime() / 1000,
                end: addDays(now, 2).toDateString(),
                duration: 'PT30M',
                repeat: FrequencyEnum.everyDay,
                allDay: false,
                type: 'BLOCK_AGENDA',
              },
            ],
            birthdays: [
              {
                userId: 'c1',
                title: 'Birthday 1',
                date: now.toDateString(),
              },
            ],
            notes: [
              {
                noteId: 'n1',
                title: 'Note 1',
                date: now.getTime() / 1000,
                repeat: FrequencyEnum.none,
              },
            ],
            transactions: [
              {
                accountId: 'a1',
                transactionId: 't1',
                title: 'Transaction 1',
                createdAt: now.toISOString(),
                total: 200,
              },
            ],
          },
        },
      ],
    };

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    component.beforeMonthViewRender({ period: { start, end } });

    eventDashboard$.next(dashboard);
    fixture.detectChanges();

    expect(component.calendar.calendarEvents.length).toBe(6);
    expect(component.calendar.calendarEvents).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({
        title: jasmine.stringContaining('Reservation 1'),
      }),
      jasmine.objectContaining({
        title: 'Unavailable 2',
      }),
      jasmine.objectContaining({
        title: 'Unavailable 3',
      }),
      jasmine.objectContaining({
        title: 'Birthday 1',
      }),
      jasmine.objectContaining({
        title: 'Transaction 1',
      }),
      jasmine.objectContaining({
        title: 'Note 1',
      }),
    ]));
  });

  it('should allow segment click', () => {
    dialogSpy.and.returnValue({
      afterClosed: () => of('unavailable,block-agenda'),
    });

    const date = new Date();
    date.setHours(18, 0);
    const professionalId = 'p1';

    component.segmentClick(date, professionalId);

    expect(dialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({ data: null }));

    expect(routerSpy.navigate).toHaveBeenCalledWith(
      [DEFAULT_LOCALE, 'unavailable', 'block-agenda'], { state: { date, professionalId, isDashboard: true } });
  });

  it('should calculate reservation duration seconds from started and finished timestamps', () => {
    const duration = DashboardEventComponent['reservationDurationSeconds']({
      started: new Date(2026, 3, 24, 8, 0).getTime() / 1000,
      finished: new Date(2026, 3, 24, 9, 30).getTime() / 1000,
    } as any);

    expect(duration).toBe(90 * 60);
  });

  it('should schedule recurring note events from the visible calendar start', () => {
    const professional = new Professional('p1', 'Prof 1', 'img1.png', { primary: '#000', secondary: '#fff' });
    const addFrequencySpy = jasmine.createSpy('addFrequency');
    const addEventSpy = spyOn(component.calendar, 'addEvent');
    const start = new Date(2026, 3, 10, 0, 0, 0, 0);
    const calendarStart = new Date(2026, 3, 15, 0, 0, 0, 0);

    component.calendar.calendarStart = calendarStart;
    component.calendar.recurringEvent = { addFrequency: addFrequencySpy } as any;

    component['addNoteEvent']({
      noteId: 'note-1',
      title: 'Recurring note',
      date: start.getTime() / 1000,
      repeat: FrequencyEnum.everyDay,
    } as any, professional, false);

    expect(addFrequencySpy).toHaveBeenCalled();
    const callback = addFrequencySpy.calls.mostRecent().args[6];
    const repeatDate = addFrequencySpy.calls.mostRecent().args[1] as Date;
    expect(repeatDate.getDate()).toBe(start.getDate());
    callback(new Date(2026, 3, 16), { title: 'Recurring note', id: 'note-1', state: 'NOTE' });
    expect(addEventSpy).toHaveBeenCalled();
  });

  it('should schedule recurring note events from the original start date when calendar start is earlier', () => {
    const professional = new Professional('p1', 'Prof 1', 'img1.png', { primary: '#000', secondary: '#fff' });
    const addFrequencySpy = jasmine.createSpy('addFrequency');
    const start = new Date(2026, 3, 20, 0, 0, 0, 0);

    component.calendar.calendarStart = new Date(2026, 3, 15, 0, 0, 0, 0);
    component.calendar.recurringEvent = { addFrequency: addFrequencySpy } as any;

    component['addNoteEvent']({
      noteId: 'note-2',
      title: 'Recurring note',
      date: start.getTime() / 1000,
      repeat: FrequencyEnum.everyDay,
    } as any, professional, false);

    expect(addFrequencySpy.calls.mostRecent().args[1]).toEqual(start);
  });

  it('should create start action for approved reservations on the current day', () => {
    const event: any = {
      id: 'reservation-3',
      title: '<b>Customer</b>',
      start: new Date(),
      end: addHours(new Date(), 1),
      meta: {
        state: States.approved,
        customerId: 'customer-1',
      },
    };

    const result = component['createTitle'](event);
    const startAction = result.actions?.find((action: any) => action.label.includes('play_arrow'));

    expect(startAction).toBeDefined();
    if (!startAction) {
      fail('Expected start action to be defined');
      return;
    }
    startAction.onClick({ event, sourceEvent: {} as MouseEvent });

    expect(storeSpy.dispatch).toHaveBeenCalledWith(startReservation('reservation-3', undefined, true, component.viewDate()));
  });

  it('should return empty status label when no state is provided', () => {
    expect(component['statusLabel'](undefined)).toBe('');
  });

  it('should dispatch approve reservation with dashboard flag', () => {
    const event: any = {
      id: 'reservation-1',
      start: new Date(),
      meta: {
        state: States.created,
      },
    };

    component['eventClick'](event, 'APPROVE');

    expect(storeSpy.dispatch).toHaveBeenCalledWith(approveReservation('reservation-1', undefined, true));
  });

  it('should dispatch start reservation with dashboard date', () => {
    const viewDate = new Date(2026, 3, 24, 0, 0, 0, 0);
    const event: any = {
      id: 'reservation-2',
      title: '<b>Customer</b>',
      start: new Date(),
      meta: {
        state: States.approved,
        customerId: 'customer-1',
        viewDate,
      },
    };

    component['eventClick'](event, 'START');

    expect(storeSpy.dispatch).toHaveBeenCalledWith(startReservation('reservation-2', undefined, true, viewDate));
  });
});
