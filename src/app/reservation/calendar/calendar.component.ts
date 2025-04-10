import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../store/app.states';
import { Observable, Subject, Subscription } from 'rxjs';
import * as fromActionsReservation from '../../store/reservation.actions';
import { Day, IRoomReservation, MAX_RESERVATION_MONTH, States } from '../../interfaces/reservation';
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
  getDuration,
  getDurationOrUndefined,
  getNowTimeZone,
  getStartEndDay,
  greaterOrEqualsThan,
  isBetween,
  newDate,
  newDateTimestamp,
  reservationDuration,
  searchDates,
  subPeriod
} from '../../util/dates';
import { IRoom, IRoomAll } from '../../interfaces/room';
import { allDayEvent, calendarEvent, createBullet, DataEvent, IDataEvent, Meta } from '../../util/event';
import { Router } from '@angular/router';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarModule } from 'angular-calendar';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { IUser, IUserAll } from '../../interfaces/user';
import { IUnavailableAll } from '../../interfaces/unavailable';
import { createRoomOffice, executeDialogNoWidth, FrequencyEnum } from '../../util/helper';
import { addDays, addMonths, isEqual } from 'date-fns';
import { findStateColor } from '../../util/theme';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { IOffice } from '../../interfaces/office';
import { requireMatch } from '../../util/validators';
import { CalendarDialogComponent } from '../../shared/dialog/calendar/calendar-dialog.component';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { INoteAll } from '../../interfaces/note';
import { AuthUserService } from '../../services/auth-user.service';
import { Role } from '../../interfaces/token';
import { SharedModule } from '../../shared/shared.module';
import { RoomNamePipe } from '../../pipes/room-name.pipe';

const CALENDAR_RESPONSIVE = {
  xsmall: {
    breakpoint: '(max-width: 576px)',
    daysInWeek: 1
  },
  small: {
    breakpoint: '(max-width: 768px)',
    daysInWeek: 2
  },
  medium: {
    breakpoint: '(max-width: 960px)',
    daysInWeek: 3
  },
  large: {
    breakpoint: '(max-width: 1280px)',
    daysInWeek: 5
  }
};

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  imports: [SharedModule, RoomNamePipe, CalendarModule]
})
export class CalendarComponent implements OnInit, OnDestroy {
  readonly dialog = inject(MatDialog);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly store: Store<AppState> = inject(Store<AppState>);
  private readonly router: Router = inject(Router);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly cdRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
  private readonly authUserService: AuthUserService = inject(AuthUserService);

  @ViewChild('picker') picker: any;

  data?: IRoomReservation;
  hourSegments = 4;
  viewDate: Date = getNowTimeZone();
  calendar: IDataEvent = new DataEvent([], 0, this.viewDate, 0, false);
  locale: string = this.translate.currentLang;
  language: string = this.translate.currentLang;
  professionalId?: string;

  officeForm!: UntypedFormGroup;
  offices?: IOffice[];
  filteredOffice?: Observable<IOffice[] | undefined>;
  office: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);
  roomList?: IRoom[];
  filteredRoom?: Observable<IRoom[] | undefined>;
  room: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);
  professionalList?: IUser[];
  filteredProfessional?: Observable<IUser[] | undefined>;
  professional: UntypedFormControl = new UntypedFormControl('', [
    requireMatch
  ]);

  refresh: Subject<any> = new Subject();
  maxDate: Date = addMonths(getNowTimeZone(), MAX_RESERVATION_MONTH);
  minDate: Date = new Date(2023, 0, 1);
  daysInWeek: number = 7;

  isDarkMode?: boolean;
  private selectView: CalendarPeriod = 'day';
  private getState: Observable<any> = this.store.select(selectReservationState);
  private destroy$ = new Subject();
  private subscription = new Subject();
  private authUserServiceSubscription: Subscription = this.authUserService.authUser.subscribe(value => {
    this.professionalId = value.professionalId;
    const darkMode: boolean = value.isDarkMode;
    if (this.isDarkMode !== undefined && darkMode !== this.isDarkMode) {
      this.tryFillData(darkMode);
    }
    this.isDarkMode = darkMode;
    this.isRoomAdmin = value.isRoomAdmin;
  });
  private roomId?: string;
  private professionalSelectedId?: string;
  private today: Date = createNewDate(getNowTimeZone());
  private isRoomAdmin = false;
  private dataReady = false;
  private calendarReady = false;

  constructor() {
    this.breakpointObserver.observe(Object.values(CALENDAR_RESPONSIVE).map(({ breakpoint }) => breakpoint))
      .pipe(takeUntil(this.destroy$)).subscribe((state: BreakpointState) => {
      const foundBreakpoint = Object.values(CALENDAR_RESPONSIVE)
        .find(({ breakpoint }) => !!state.breakpoints[breakpoint]);
      if (foundBreakpoint) {
        this.daysInWeek = foundBreakpoint.daysInWeek;
      } else {
        this.daysInWeek = 7;
      }
      this.cdRef.markForCheck();
    });
  }

  get search(): void {
    return this.getReservations();
  }

  get totalDays(): number {
    // set 0 for full week
    return this.daysInWeek === 7 ? 0 : this.daysInWeek;
  }

  get increment(): void {
    return this.picker.select(addPeriod(this.selectView, this.viewDate, this.daysInWeek));
  }

  get decrement(): void {
    return this.picker.select(subPeriod(this.selectView, this.viewDate, this.daysInWeek));
  }

  get downloadPDF(): void {
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
      const endDate = addDays(this.searchDate, Math.floor(this.daysInWeek / 2));
      const startDate = addDays(endDate, 1 - this.daysInWeek);

      document.title = `From ${ formatDateTwoDigit(startDate, this.locale) } to ${ formatDateTwoDigit(endDate,
        this.locale) }`;

      document.body.innerHTML = clone.innerHTML;
      window.print();
      location.reload();
    }
    return;
  }

  private get searchDate(): Date {
    return this.totalDays ? addDays(this.viewDate, Math.floor(this.daysInWeek / 2)) :
      this.getRelevantWednesday(this.viewDate);
  }

  ngOnInit(): void {
    this.createForm();
    this.createFilters();
    this.subscribe();
    this.clean();
    this.getRoomList();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.destroy$.unsubscribe();
    this.authUserServiceSubscription.unsubscribe();
  }

  displayFnOffice = (office: IOffice): string => office ? `${ office.name }` : '';

  displayFnRoom = (room: IRoom): string => room.address ? room.address.name : '';

  displayFnProfessional = (professional: IUser): string => professional?.displayName ? professional.displayName : '';

  keyDownHandler = (event: any, form: UntypedFormControl): void => {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  };

  keyDownOffice = (event: any): void => {
    if (event.code === 'Backspace') {
      this.office.setValue('');
      this.keyDownRoom(event);
    }
  };

  keyDownRoom = (event: any): void => {
    if (event.code === 'Backspace') {
      this.professionalList = undefined;
      this.roomId = undefined;
      this.professionalSelectedId = undefined;
      this.keyDownHandler(event, this.professional);
      this.keyDownHandler(event, this.room);
    }
  };

  view = (event: CalendarEvent): void => {
    if (event.id) {
      this.router.navigate([event.id]);
    }
  };

  segmentClick = (date: Date): void => {
    const room = this.data?.room;
    const data = { date, room, professional: this.professional.value };
    if (date && room && this.dateIsValid(date)) {
      executeDialogNoWidth(this.dialog, CalendarDialogComponent, null, result => {
        if (result) {
          this.router.navigate([this.language].concat(result.split(',')), { state: data });
        }
      });
    }
  };

  selectDate = (event: any): void => {
    this.changeDate(newDate(event.value));
    this.getReservations();
  };

  beforeMonthViewRender = ({ header, period }: any): void => {
    if (this.calendar) {
      this.calendar.calendarStart = period.start;
      this.calendar.calendarEnd = period.end;
      this.calendar.createRecurring();
      this.calendarReady = true;
      this.tryFillData();
    }
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
          new fromActionsReservation.UpdateTimestamp({
            reservation: event.meta,
            start: event.start.toLocaleString(API_LOCALE),
            role: this.isRoomAdmin ? Role.roomAdmin : Role.professional
          })
        );
      } else {
        event.start = oldStart;
        event.end = oldEnd;
        this.refresh.next(event);
      }
    });
  };

  private createForm = (): void => {
    this.officeForm = this.formBuilder.group({
      office: this.office,
      room: this.room,
      professional: this.professional
    });
    this.valueChanges();
  };

  private valueChanges = (): void => {
    this.office.valueChanges.subscribe(value => {
      if (!value) {
        return;
      }
      this.roomList = value.rooms;
      const room = value.rooms?.find((o: IOffice) => o.id === this.roomId);
      if (room) {
        this.roomList = value.rooms;
        if (this.room.value.id !== this.roomId) {
          this.room.setValue(room);
          this.roomId = this.room.value.id;
        }
      } else {
        if (this.roomList?.length === 1) {
          this.room.setValue(this.roomList[0]);
        } else {
          this.room.setValue('');
        }
      }
    });
    this.room.valueChanges.subscribe((value) => {
      if (value) {
        this.roomId = value.id;
        this.professionalList = value.professionals;
        const professional = value.professionals?.find((o: IRoom) => o.id === this.professionalSelectedId);
        if (professional) {
          this.professionalList = value.professionals;
          if (this.professional.value.id !== this.professionalSelectedId) {
            this.professional.setValue(professional);
            this.professionalSelectedId = this.professional.value.id;
          }
        } else {
          if (this.professionalList?.length === 1) {
            this.professional.setValue(this.professionalList[0]);
          } else {
            this.professional.setValue('');
          }
        }
      }
    });
    this.professional.valueChanges.subscribe(value => this.professionalSelectedId = value ? value.id : undefined);
  };

  private createFilters = (): void => {
    this.filteredOffice = this.office.valueChanges.pipe(startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterOffice(name) : this.offices ? this.offices.slice() : this.offices)
    );
    this.filteredRoom = this.room.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(addressName => addressName ? this.filterRoom(addressName) :
        this.roomList ? this.roomList.slice() : this.roomList)
    );
    this.filteredProfessional = this.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(addressName => addressName ? this.filterProfessional(addressName) : this.professionalList
        ? this.professionalList.slice() : this.professionalList)
    );
  };

  private changeDate = (date: Date): void => {
    const newDate = createNewDate(date, this.viewDate.getHours(), this.viewDate.getMinutes());
    this.viewDate = this.totalDays ? addDays(newDate, -Math.floor(this.daysInWeek / 2)) : newDate;
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
        treatments
      });

      const color = findStateColor(it.state, darkMode);
      const meta = new Meta(true, it.room.timeZone);
      meta.id = it.id;
      meta.customer = it.customer.displayName;
      meta.isReservation = true;
      const draggable = [States.approved, States.created, States.partiallyPaid, States.paid].includes(
        it.state as States);
      const event = calendarEvent(detail, color, start, darkMode, end, `${ this.language }/reservation/${ it.id }`,
        meta, draggable);
      if (it.showNotification) {
        event.cssClass = `diagonal ${ it.state.toLowerCase() }`;
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
        const duration = getDuration(it.allDay, it.duration);
        const id = it.id;
        const allDay = it.allDay;
        const professionalId = it.professional.id;
        const title = this.translate.instant('RESERVATION.EVENT.UNAVAILABLE', {
          description: it.description ?? '',
          professionalName: it.professional.displayName
        });
        let path = `${ this.language }/unavailable/`;
        if (it.type === 'BLOCK_AGENDA') {
          path += 'block-agenda/';
        }
        if (it.repeat === 'NONE') {
          if (!greaterOrEqualsThan(start, this.maxDate)) {
            const data = { id, allDay, title, path, duration, professionalId };
            this.validateUnavailable(rr.room, start, data, darkMode);
          }
        } else {
          this.calendar.recurringEvent?.addFrequency(it.repeat, start, id, title, 'UNAVAILABLE', path,
            (date, recurring) => this.validateUnavailable(rr.room, date, recurring, darkMode),
            getDurationOrUndefined(it.duration), professionalId, it.allDay);
        }
      }
    });
  };

  private addBirthdays = (rr: IRoomReservation, darkMode: boolean): void => {
    const birthdays: IUserAll[] = rr.birthdays;
    birthdays.forEach(it => {
      if (it.dob) {
        const detail = this.translate.instant('RESERVATION.EVENT.BIRTHDAY', {
          customerName: it.displayName
        });
        const startDate = newDateTimestamp(it.dob);
        startDate.setFullYear(getNowTimeZone().getFullYear());
        const color = findStateColor('BIRTHDAY', darkMode);
        const event = allDayEvent(detail, color, startDate, darkMode, `${ this.language }/users/${ it.id }`);
        this.calendar?.addEvent(event);
      }
    });
  };

  private addNotes = (rr: IRoomReservation, darkMode: boolean): void => {
    const notes: INoteAll[] = rr.notes;
    notes.forEach(it => {
      const title = this.translate.instant('RESERVATION.EVENT.NOTE', {
        note: it.description
      });
      const startDate = newDateTimestamp(it.date);
      const state = 'NOTE';
      const path = `${ this.language }/notes/${ it.id }`;
      if (it.repeat === FrequencyEnum.none) {
        this.createNoteEvent(title, state, path, startDate, darkMode);
      } else {
        this.calendar.recurringEvent?.addFrequency(it.repeat, startDate, it.id, title, state, path,
          (date, recurring) => this.createNoteEvent(recurring.title, recurring.state, recurring.path, date, darkMode));
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
      this.createUnavailableEvent(room, dataEvent.day, recurring, startSearch,
        endSearch, darkMode, dataEvent);
    }
  };

  private createUnavailableEvent(room: IRoomAll, day: any, recurring: any, start: Date,
                                 end: Date, darkMode: boolean, dataEvent: IDataEvent): void {
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

  private fillData(darkMode: boolean = false): void {
    if (this.data) {
      this.calendar.addEvents(this.addReservations(this.data, darkMode));
      const timeZone = this.data.room.timeZone;
      const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = getAvailability(
        this.data.room);
      const unavailable = this.translate.instant('RESERVATION.EVENT.MESSAGE.UNAVAILABLE');
      const lunch = this.translate.instant('RESERVATION.EVENT.MESSAGE.LUNCH');
      const notWorking = this.translate.instant('RESERVATION.EVENT.MESSAGE.OUT_OF_WORK');
      this.calendar.recurringEvent?.addNotAvailableRecurring(this.calendar, unavailable, lunch, notWorking, sunday,
        saturday, friday, thursday, wednesday, tuesday, monday, darkMode, timeZone);
      this.addUnavailableList(this.data, darkMode);
      this.addBirthdays(this.data, darkMode);
      this.addNotes(this.data, darkMode);

      this.calendar.recurringEvent?.execute();
    }
  }

  private filterOffice = (name: string): IOffice[] | undefined => this.offices?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private filterRoom = (addressName: string): IRoom[] | undefined => this.roomList?.filter(
    option => option.address?.name?.toLowerCase().indexOf(addressName.toLowerCase()) === 0);

  private filterProfessional = (name: string): IUser[] | undefined => this.professionalList?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private clean = (): void => {
    this.calendar.resetEvents();
    this.store.dispatch(
      new fromActionsReservation.Clean()
    );
  };

  private getReservations = (): void => {
    this.calendar.resetEvents();
    this.store.dispatch(
      new fromActionsReservation.GetAllGroupingByRoom({
        days: this.daysInWeek,
        date: this.searchDate,
        roomId: this.roomId,
        professionalId: this.professionalSelectedId
      })
    );
  };

  private getRoomList = (): void => this.store.dispatch(new fromActionsReservation.FindRooms());

  private tryFillData = (darkMode = this.isDarkMode): void => {
    if (this.dataReady && this.calendarReady) {
      this.fillData(darkMode);
      this.calendarReady = false;
      this.dataReady = false;
    }
  };

  private subscribe = (): void => {
    this.getState.pipe(takeUntil(this.subscription)).subscribe((state) => {
      this.offices = Array.from(createRoomOffice(state.rooms)?.values() || []);
      if (this.offices && this.roomId && !this.office.value) {
        this.office.setValue(
          this.offices?.find(office => office.rooms?.find(o => o.id === this.roomId) ? office : undefined));
      } else if (this.offices && this.offices.length === 1) {
        this.office.setValue(this.offices[0]);
      }
      if (state.data && state.data.room && state.data.reservations) {
        this.data = state.data;
        if (this.data) {
          const timeZone = this.data.room.timeZone;
          const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, exclude } = getAvailability(
            this.data.room);
          const { min, max } = getStartEndDay(monday, tuesday, wednesday, thursday, friday, saturday, sunday, timeZone);
          this.calendar.day = new Day(min, max, getNowTimeZone(), exclude, 1);
        }
        this.dataReady = true;
        this.tryFillData();
      }
    });
  };
}
