import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { AuthUserService } from '../services/auth-user.service';
import { Professional } from './day-view-scheduler.component';
import { IProfessionalEvent, IRoomEvents } from '../interfaces/dashboard';
import { addDays, addHours } from 'date-fns';
import { States } from '../interfaces/reservation';
import { FrequencyEnum } from '../util/helper';
import { daysOfWeek } from '../util/dates';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;
  let openDialogSpy: jasmine.Spy<any>;
  let mockRouter: jasmine.SpyObj<Router>;

  let storeMock: any;
  let authUserServiceMock: any;
  let stateSubject: Subject<any>;
  let authUserSubject: Subject<any>;

  beforeEach(async () => {
    stateSubject = new Subject();
    authUserSubject = new Subject();

    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);

    storeMock = {
      select: jasmine.createSpy().and.returnValue(stateSubject.asObservable()),
      dispatch: jasmine.createSpy(),
    };
    authUserServiceMock = { authUser: authUserSubject.asObservable() };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeMock },
        { provide: Router, useValue: mockRouter },
        { provide: AuthUserService, useValue: authUserServiceMock },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en-GB');
    translateService.use('en-GB');

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    openDialogSpy = spyOn(component.dialog, 'open');

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should dispatch Clean and GetMyEvent on init', () => {
    expect(storeMock.dispatch).toHaveBeenCalledWith(jasmine.anything()); // Clean
    expect(storeMock.dispatch).toHaveBeenCalledWith(jasmine.anything()); // GetMyEvent
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

    (component as any).professionalChanged({ event, newProfessional: newProf });

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
    const result = (component as any).createTitle(event);
    expect(result.title).toContain('timing');
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
    const url = (DashboardComponent as any).getProfessionalImage(prof);
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
    const url = (DashboardComponent as any).getProfessionalImage(prof);
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
    const url = (DashboardComponent as any).getProfessionalImage(prof);
    expect(url).toBe('assets/icons/icon-512x512.png');
  });

  it('should add the events to the calendar', () => {
    const now = new Date();
    now.setHours(11, 0);
    const dashboard: IRoomEvents = {
      roomId: 'r1',
      roomName: 'Room 1',
      timeZone: 'Europe/Amsterdam',
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

    stateSubject.next({ dashboard });

    expect(component.calendar.calendarEvents).toEqual([
      jasmine.objectContaining({
        title: 'Reservation 1',
      }), jasmine.objectContaining({
        title: 'Unavailable 2',
      }), jasmine.objectContaining({
        title: 'Unavailable 3',
      })]);
  });

  it('should allow segment click', () => {
    openDialogSpy.and.returnValue({
      afterClosed: () => of('unavailable,block-agenda'),
    });

    const date = new Date();
    date.setHours(18, 0);
    const professionalId = 'p1';

    component.segmentClick(date, professionalId);

    expect(openDialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({ data: null }));

    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['en-GB', 'unavailable', 'block-agenda'], { state: { date, professionalId, isDashboard: true } });
  });
});
