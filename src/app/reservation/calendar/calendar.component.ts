import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatestWith, Subject } from 'rxjs';
import { getAllGroupingByRoom, updateReservationTimestamp } from '../../store/reservation.actions';
import { Day, IDay, IRoomReservation, MAX_RESERVATION_MONTH, States } from '../../interfaces/reservation';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import {
  addPeriod,
  API_LOCALE,
  CalendarPeriod,
  createNewDate,
  formatDateTime,
  formatDateTwoDigit,
  getAvailability,
  getDurationOrUndefined,
  getNowTimeZone,
  getStartEndDay,
  isBetween,
  newDate,
  newDateTimestamp,
  reservationDuration,
  searchDates,
  subPeriod,
} from '../../util/dates';
import { IRoom, IRoomAll } from '../../interfaces/room';
import {
  allDayEvent,
  calendarEvent,
  createBullet,
  DataEvent,
  IDataEvent,
  LUNCH,
  Meta,
  OUT_OF_WORK,
  OUT_OF_WORK_ALL_DAY,
} from '../../util/event';
import { Router } from '@angular/router';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarModule } from 'angular-calendar';
import { BreakpointObserver } from '@angular/cdk/layout';
import { IUser, IUserAll } from '../../interfaces/user';
import { IUnavailableAll } from '../../interfaces/unavailable';
import { createRoomOffice, executeDialogNoWidth, FrequencyEnum, getList } from '../../util/helper';
import { addDays, addMonths, isEqual } from 'date-fns';
import { findStateColor } from '../../util/theme';
import { map, startWith } from 'rxjs/operators';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { IOffice, IOfficeAll } from '../../interfaces/office';
import { requireMatch } from '../../util/validators';
import { CalendarDialogComponent } from '../../shared/dialog/calendar/calendar-dialog.component';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { INoteAll } from '../../interfaces/note';
import { AuthUserService } from '../../services/auth-user.service';
import { Role } from '../../interfaces/token';
import { SharedModule } from '../../shared/shared.module';
import { RoomNamePipe } from '../../pipes/room-name.pipe';
import { ReservationState } from '../../store/reducers/reservation.reducers';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { getCalendarPipe, getRoomsPipe } from '../../store/selectors/reservation.selectors';
import { MatDatepicker } from '@angular/material/datepicker';

const CALENDAR_RESPONSIVE = {
  xsmall: {
    breakpoint: '(max-width: 576px)',
    daysInWeek: 1,
  },
  small: {
    breakpoint: '(max-width: 768px)',
    daysInWeek: 2,
  },
  medium: {
    breakpoint: '(max-width: 960px)',
    daysInWeek: 3,
  },
  large: {
    breakpoint: '(max-width: 1280px)',
    daysInWeek: 5,
  },
};

type CalendarForm = {
  office: FormControl<IOfficeAll | undefined>;
  room: FormControl<IRoomAll | undefined>;
  professional: FormControl<IUserAll | undefined>;
};

// TODO is not working
// TODO update calendar events to signals.
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  imports: [SharedModule, RoomNamePipe, CalendarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent {
  private readonly dialog = inject(MatDialog);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly store: Store<ReservationState> = inject(Store<ReservationState>);
  private readonly router: Router = inject(Router);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly authUserService: AuthUserService = inject(AuthUserService);

  private rooms$ = this.store.pipe(getRoomsPipe);
  private calendar$ = this.store.pipe(getCalendarPipe);
  private breakpoints$ = this.breakpointObserver.observe(
    Object.values(CALENDAR_RESPONSIVE).map(({ breakpoint }) => breakpoint),
  );

  private roomsSignal = toSignal(this.rooms$);
  private authUserSignal = this.authUserService.authUser;
  private breakpointsSignal = toSignal(this.breakpoints$, {
    initialValue: {
      matches: false,
      breakpoints: Object.fromEntries(
        Object.values(CALENDAR_RESPONSIVE).map(({ breakpoint }) => [breakpoint, false]),
      ),
    },
  });

  private isRoomAdmin = computed(() => this.authUserSignal()?.isRoomAdmin ?? false);

  calendarSignal = toSignal(this.calendar$);
  isDarkMode = computed(() => this.authUserSignal()?.isDarkMode ?? false);
  daysInWeekSignal = computed(() => {
    const state = this.breakpointsSignal();
    if (!state) {
      return 7;
    }
    const foundBreakpoint = Object.values(CALENDAR_RESPONSIVE)
      .find(({ breakpoint }) => state.breakpoints[breakpoint]);

    return foundBreakpoint?.daysInWeek ?? 7;
  });

  form: FormGroup<CalendarForm> = this.formBuilder.group<CalendarForm>({
    office: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    room: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    professional: this.formBuilder.control(undefined, {
      validators: [requireMatch],
    }),
  });

  offices = computed(() => Array.from(createRoomOffice(this.roomsSignal())?.values() || []));
  filteredOfficeSignal = toSignal(
    this.getForm.office.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name),
      combineLatestWith(toObservable(this.offices)),
      map(([name, offices]) => {
        if (name) {
          return this.filterOffice(name, offices);
        } else {
          return offices ? offices.slice() : offices;
        }
      })),
  );

  roomList = signal<IRoomAll[] | undefined>(undefined);
  filteredRoomSignal = toSignal(
    this.getForm.room.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.address?.name),
      combineLatestWith(toObservable(this.roomList)),
      map(([name, rooms]) => {
        if (name) {
          return this.filterRoom(name, rooms);
        } else {
          return rooms ? rooms.slice() : rooms;
        }
      })),
  );

  professionalList = signal<IUserAll[] | undefined>(undefined);
  filteredProfessionalSignal = toSignal(
    this.getForm.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.displayName),
      combineLatestWith(toObservable(this.professionalList)),
      map(([name, professionals]) => {
        if (name) {
          return this.filterProfessional(name, professionals);
        } else {
          return professionals ? professionals.slice() : professionals;
        }
      })),
  );

  private selectOfficeSignal = toSignal(this.getForm.office.valueChanges);
  private selectRoomSignal = toSignal(this.getForm.room.valueChanges);
  private selectProfessionalSignal = toSignal(this.getForm.professional.valueChanges);

  picker = viewChild(MatDatepicker);

  viewDate = signal(getNowTimeZone());
  hourSegments = 4;
  calendar: IDataEvent = new DataEvent([], 0, this.viewDate(), 0, false);
  calendarEventsSignal = signal<CalendarEvent[]>([]);
  calendarDaySignal = signal<IDay | undefined>(undefined);
  calendarRoomSignal = signal<IRoomAll | undefined>(undefined);
  locale: string = this.translate.currentLang;
  language: string = this.translate.currentLang;
  professionalId?: string;

  refresh: Subject<any> = new Subject();
  maxDate: Date = addMonths(getNowTimeZone(), MAX_RESERVATION_MONTH);
  minDate: Date = new Date(2023, 0, 1);

  isCalendarLoading = true;
  isLoading = true;

  private roomId = signal<string | undefined>(undefined);
  private selectView: CalendarPeriod = 'day';
  private professionalSelectedId = signal(this.selectProfessionalSignal()?.id);
  private today: Date = createNewDate(getNowTimeZone());
  private previousDarkMode?: boolean;

  constructor() {
    effect(() => {
      const calendarRooms = this.calendarSignal();
      if (!calendarRooms) {
        return;
      }
      const calendarData = calendarRooms[0];
      if (calendarData?.room) {
        const timeZone = calendarData.room.timeZone;
        const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, exclude } = getAvailability(
          calendarData.room);
        const { min, max } = getStartEndDay(monday, tuesday, wednesday, thursday, friday, saturday, sunday,
          timeZone);
        const day = new Day(min, max, getNowTimeZone(), exclude, 1);
        this.calendar.day = day;
        this.calendar.room = calendarData.room;
        this.fillData(this.isDarkMode(), calendarData);

        this.calendarDaySignal.set(day);
        this.calendarRoomSignal.set(calendarData.room);
        this.calendarEventsSignal.set([...this.calendar.calendarEvents]);
      }
      this.isLoading = false;
      this.isCalendarLoading = false;
    });

    effect(() => {
      const current = this.isDarkMode();
      if (this.previousDarkMode !== undefined && current !== this.previousDarkMode) {
        const calendarRooms = this.calendarSignal();
        if (!calendarRooms) {
          return;
        }
        const calendarData = calendarRooms[0];
        this.fillData(current, calendarData);

        this.calendarEventsSignal.set([...this.calendar.calendarEvents]);
      }
      this.previousDarkMode = current;
    });

    effect(() => {
      const offices = this.offices();
      if (offices && offices.length === 1) {
        this.getForm.office.setValue(offices[0]);
      }
    });

    effect(() => {
      const office = this.selectOfficeSignal();
      if (!office) {
        this.isLoading = true;
        return;
      }
      this.isLoading = false;
      this.roomList.set(office.rooms);
      const room = getList(office.rooms, this.roomId());
      this.getForm.room.setValue(room);
      this.roomId.set(room?.id);
    });

    effect(() => {
      const room = this.selectRoomSignal();
      if (!room) {
        this.isLoading = true;
        return;
      }
      this.isLoading = false;
      this.roomId.set(room.id);
      this.professionalList.set(room.professionals);
      const professional = getList(room.professionals, this.professionalSelectedId());
      this.getForm.professional.setValue(professional);
      this.professionalSelectedId.set(professional?.id);
    });

    effect(() => {
      const roomId = this.roomId();
      this.getReservations(roomId);
    });
  }

  get totalDays(): number {
    // set 0 for full week
    const daysInWeek = this.daysInWeekSignal();
    return daysInWeek === 7 ? 0 : daysInWeek;
  }

  get getForm(): CalendarForm {
    return this.form.controls;
  }

  search() {
    const roomId = this.roomId();
    this.getReservations(roomId);
  }

  private get searchDate(): Date {
    const viewDate = this.viewDate();
    return this.totalDays ? addDays(viewDate, Math.floor(this.daysInWeekSignal() / 2)) :
      this.getRelevantWednesday(viewDate);
  }

  increment() {
    this.picker()?.select(addPeriod(this.selectView, this.viewDate(), this.daysInWeekSignal()));
  }

  decrement() {
    this.picker()?.select(subPeriod(this.selectView, this.viewDate(), this.daysInWeekSignal()));
  }

  downloadPDF() {
    const element = document.getElementById('weekViewPDF');
    if (element) {
      const clone = element.cloneNode(true) as HTMLElement;

      clone.style.marginTop = '40px';
      clone.style.transform = 'scaleY(0.8)';
      clone.style.transformOrigin = 'top';
      const events = clone.getElementsByClassName('cal-event');
      for (let i = 0; i < events.length; i++) {
        (events[i] as HTMLElement).style.backgroundColor = '#fff';
      }
      const headerPast = clone.querySelectorAll('.cal-header.cal-disabled, .cal-header.cal-future');
      for (let i = 0; i < headerPast.length; i++) {
        headerPast[i].classList.remove('cal-future', 'cal-disabled');
        headerPast[i].classList.add('cal-today');
      }
      const daysInWeek = this.daysInWeekSignal();
      const endDate = addDays(this.searchDate, Math.floor(daysInWeek / 2));
      const startDate = addDays(endDate, 1 - daysInWeek);

      document.title = `From ${formatDateTwoDigit(startDate, this.locale)} to ${formatDateTwoDigit(endDate,
        this.locale)}`;

      document.body.innerHTML = clone.innerHTML;
      window.print();
      location.reload();
    }
  }

  displayFnOffice = (office: IOffice): string => office ? `${office.name}` : '';

  displayFnRoom = (room: IRoom): string => room.address ? room.address.name : '';

  displayFnProfessional = (professional: IUser): string => professional?.displayName ? professional.displayName : '';

  keyDownHandler = (event: KeyboardEvent, form: FormControl): void => {
    if (event.code === 'Backspace') {
      form.setValue(undefined);
    }
  };

  keyDownOffice = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.office.setValue(undefined);
      this.keyDownRoom(event);
    }
  };

  keyDownRoom = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.professionalList.set(undefined);
      this.roomId.set(undefined);
      this.professionalSelectedId.set(undefined);
      this.keyDownHandler(event, this.getForm.professional);
      this.keyDownHandler(event, this.getForm.room);
    }
  };

  view = (event: CalendarEvent): void => {
    if (event.id && ![OUT_OF_WORK_ALL_DAY, OUT_OF_WORK, LUNCH].includes(`${event.id}`)) {
      this.router.navigate([event.id]);
    }
  };

  segmentClick = (date: Date, room?: IRoomAll): void => {
    const professional = this.getForm.professional.value;
    if (date && room && this.dateIsValid(date)) {
      const data = { date, roomId: room.id, professionalId: professional?.id };
      executeDialogNoWidth(this.dialog, CalendarDialogComponent, null, result => {
        if (result) {
          this.router.navigate([this.language].concat(result.split(',')), { state: data });
        }
      });
    }
  };

  selectDate = (event: any): void => {
    this.changeDate(newDate(event.value));
    const roomId = this.roomId();
    this.getReservations(roomId);
  };

  beforeMonthViewRender = ({ header, period }: any): void => {
    this.calendar.calendarStart = period.start;
    this.calendar.calendarEnd = period.end;
    this.calendar.createRecurring();
    header.forEach((day: any) => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
  };

  eventTimesChanged = ({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void => {
    if (isEqual(event.start, newStart)) {
      return;
    }
    const oldStart = event.start;
    const oldEnd = event.end;
    event.start = newStart;
    event.end = newEnd;
    this.refresh.next(event);
    const title = this.translate.instant('RESERVATION.MOVE.TITLE', { customer: event.meta.customer?.trim() });
    const from = formatDateTime(oldStart, this.locale);
    const to = formatDateTime(newStart, this.locale);
    const content = this.translate.instant('RESERVATION.MOVE.CONTENT', { from, to });
    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: event }, result => {
      if (result) {
        this.store.dispatch(
          updateReservationTimestamp({
            id: event.meta.id,
            start: event.start.toLocaleString(API_LOCALE),
            role: this.isRoomAdmin() ? Role.roomAdmin : Role.professional,
            timeZone: event.meta.timeZone,
          }),
        );
      } else {
        event.start = oldStart;
        event.end = oldEnd;
        this.refresh.next(event);
      }
    });
  };

  private changeDate = (date: Date): void => {
    this.viewDate.update(viewDate => {
      const newDate = createNewDate(date, viewDate.getHours(), viewDate.getMinutes());
      return this.totalDays ? addDays(newDate, -Math.floor(this.daysInWeekSignal() / 2)) : newDate;
    });
  };

  private dateIsValid = (date: Date): boolean => isBetween(this.today, this.maxDate, date);

  private addReservations = (rr: IRoomReservation, darkMode: boolean): CalendarEvent[] => rr.reservations.map(it => {
    if (it.treatment.duration) {
      const start = newDateTimestamp(it.timestamp);
      const duration = reservationDuration(it);
      const end = createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
      let treatments = createBullet(it.treatment.name);
      treatments += it.additional?.map(additional => createBullet(additional.name));

      const detail = this.translate.instant('RESERVATION.EVENT.DETAIL', {
        customerName: it.customer.displayName,
        professionalName: it.professional.displayName,
        treatments,
      });

      const color = findStateColor(it.state, darkMode);
      const meta = new Meta(true, it.room.timeZone);
      meta.id = it.id;
      meta.customer = it.customer.displayName;
      meta.isReservation = true;
      const draggable = [States.approved, States.created, States.partiallyPaid, States.paid].includes(
        it.state as States);
      const event = calendarEvent(detail, color, start, darkMode, end, `${this.language}/reservation/${it.id}`,
        meta, draggable);
      if (it.showNotification) {
        event.cssClass = `diagonal ${it.state.toLowerCase()}`;
      }
      return event;
    }
    return undefined;
  }).filter((item): item is CalendarEvent => item !== undefined) ?? [];

  private addUnavailableList = (rr: IRoomReservation, darkMode: boolean): void => {
    const unavailableList: IUnavailableAll[] = rr.unavailableList;
    unavailableList.forEach(it => {
      if (it.duration || it.allDay) {
        const startDate = newDateTimestamp(it.timestamp, rr.room.timeZone);
        const start = it.allDay ? createNewDate(startDate) : startDate;
        const id = it.id;
        const professionalId = it.professional.id;
        const title = this.translate.instant('RESERVATION.EVENT.UNAVAILABLE', {
          description: it.description ?? '',
          professionalName: it.professional.displayName,
        });
        let path = `${this.language}/unavailable/`;
        if (it.type === 'BLOCK_AGENDA') {
          path += 'block-agenda/';
        }
        this.calendar.recurringEvent?.addFrequency(it.repeat, start, id, title, 'UNAVAILABLE', path,
          (date, recurring) => this.validateUnavailable(rr.room, date, recurring, darkMode),
          getDurationOrUndefined(it.duration), professionalId, it.allDay);
      }
    });
  };

  private addBirthdays = (rr: IRoomReservation, darkMode: boolean): void => {
    const birthdays: IUserAll[] = rr.birthdays;
    birthdays.forEach(it => {
      if (it.dob) {
        const detail = this.translate.instant('RESERVATION.EVENT.BIRTHDAY', {
          customerName: it.displayName,
        });
        const startDate = newDateTimestamp(it.dob);
        startDate.setFullYear(getNowTimeZone().getFullYear());
        const color = findStateColor('BIRTHDAY', darkMode);
        const event = allDayEvent(detail, color, startDate, darkMode, `${this.language}/users/${it.id}`);
        this.calendar?.addEvent(event);
      }
    });
  };

  private addNotes = (rr: IRoomReservation, darkMode: boolean): void => {
    const notes: INoteAll[] = rr.notes;
    notes.forEach(it => {
      const title = this.translate.instant('RESERVATION.EVENT.NOTE', {
        note: it.description,
      });
      const startDate = newDateTimestamp(it.date);
      const state = 'NOTE';
      const path = `${this.language}/notes/${it.id}`;
      if (it.repeat === FrequencyEnum.none) {
        this.createNoteEvent(title, state, path, startDate, darkMode);
      } else {
        this.calendar.recurringEvent?.addFrequency(it.repeat, startDate, it.id, title, state, path,
          (date, recurring) => this.createNoteEvent(recurring.title, recurring.state, recurring.path,
            date, darkMode));
      }
    });
  };

  private createNoteEvent = (title: string, state: string, path: string, date: Date, darkMode: boolean): void => {
    const color = findStateColor(state, darkMode);
    const event = allDayEvent(title, color, date, darkMode, path);
    this.calendar?.addEvent(event);
  };

  private validateUnavailable = (room: IRoomAll, start: Date, recurring: any, darkMode: boolean): void => {
    const dataEvent = this.calendar;
    if (dataEvent) {
      const [startSearch, endSearch] = searchDates(recurring.allDay, start, recurring.duration);
      this.createUnavailableEvent(room, recurring, startSearch,
        endSearch, darkMode, dataEvent, dataEvent.day);
    }
  };

  private createUnavailableEvent(
    room: IRoomAll, recurring: any, start: Date,
    end: Date, darkMode: boolean, dataEvent: IDataEvent, day?: IDay,
  ): void {
    const color = findStateColor('DEFAULT', darkMode);
    const meta = new Meta(!recurring.allDay, room.timeZone);
    const event = calendarEvent(recurring.title, color, start, darkMode, end, recurring.path + recurring.id, meta);
    dataEvent.addEvent(event);
    dataEvent.day = day;
  }

  private getRelevantWednesday(date: Date): Date {
    const dayOfWeek = date.getDay();

    const wednesday: Date = new Date(date);
    wednesday.setDate(date.getDate() - (dayOfWeek - 3));
    return wednesday;
  }

  private fillData(darkMode: boolean = false, calendar: IRoomReservation): void {
    this.calendar.addEvents(this.addReservations(calendar, darkMode));
    const timeZone = calendar.room.timeZone;
    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = getAvailability(
      calendar.room);
    const unavailable = this.translate.instant('RESERVATION.EVENT.MESSAGE.UNAVAILABLE');
    const lunch = this.translate.instant('RESERVATION.EVENT.MESSAGE.LUNCH');
    const notWorking = this.translate.instant('RESERVATION.EVENT.MESSAGE.OUT_OF_WORK');
    this.calendar.recurringEvent?.addNotAvailableRecurring(this.calendar, unavailable, lunch, notWorking, sunday,
      saturday, friday, thursday, wednesday, tuesday, monday, darkMode, timeZone);
    this.addUnavailableList(calendar, darkMode);
    this.addBirthdays(calendar, darkMode);
    this.addNotes(calendar, darkMode);

    this.calendar.recurringEvent?.execute();
  }

  private filterOffice = (name: string, offices?: IOfficeAll[]): IOfficeAll[] | undefined => offices?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private filterRoom = (addressName: string, roomList?: IRoomAll[]): IRoomAll[] | undefined => roomList?.filter(
    option => option.address?.name?.toLowerCase().indexOf(addressName.toLowerCase()) === 0);

  private filterProfessional = (
    name: string,
    professionalList?: IUserAll[],
  ): IUserAll[] | undefined => professionalList?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private getReservations = (roomId?: string): void => {
    if (!roomId) {
      return;
    }
    this.calendar.resetEvents();
    this.isLoading = true;
    this.isCalendarLoading = true;
    this.store.dispatch(
      getAllGroupingByRoom({
        days: this.daysInWeekSignal(),
        date: this.searchDate,
        roomId,
        professionalId: this.professionalSelectedId(),
      }),
    );
  };
}
