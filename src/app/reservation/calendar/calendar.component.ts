import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../store/app.states';
import { Observable, Subject, Subscription } from 'rxjs';
import * as fromActionsReservation from '../../store/reservation.actions';
import { Calendar, Day, ICalendar, IReservationAll, IRoomReservation, MAX_RESERVATION_MONTH, States } from '../../interfaces/reservation';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import {
  addPeriod,
  API_LOCALE,
  CalendarPeriod,
  createNewDate,
  formatDateTime,
  getAvailability,
  getDuration, getDurationOrUndefined,
  getNow, getPreviousSunday,
  getStartEndDay,
  greaterOrEqualsThan,
  isBetween,
  newDate,
  newDateTimestamp,
  plusDays,
  reservationDuration, searchDates,
  subPeriod
} from '../../util/dates';
import { IRoom, IRoomAll } from '../../interfaces/room';
import { allDayEvent, calendarEvent, createBullet, fillNotAvailable, getFrequency, getOverlapEvent, Meta } from '../../util/event';
import { Router } from '@angular/router';
import { CalendarEvent, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { IUser, IUserAll } from '../../interfaces/user';
import { IUnavailableAll } from '../../interfaces/unavailable';
import { createRoomOffice, executeDialogNoWidth, FrequencyEnum } from '../../util/helper';
import { addDays, addMonths, isEqual, isSameDay, startOfWeek } from 'date-fns';
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

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {
  @ViewChild('picker') picker: any;

  data?: IRoomReservation;
  calendar?: ICalendar;
  hourSegments = 4;
  viewDate: Date = getNow();
  locale: string;
  language: string;
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
  maxDate: Date;
  minDate: Date;

  private isDarkMode?: boolean;
  private selectView: CalendarPeriod = 'day';
  private getState: Observable<any>;
  private destroy$ = new Subject();
  private subscription = new Subject();
  private authUserServiceSubscription: Subscription;
  private roomId?: string;
  private professionalSelectedId?: string;
  private today: Date = createNewDate(getNow());
  private daysInWeek = 7;
  private isRoomAdmin = false;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private store: Store<AppState>,
              private router: Router, private breakpointObserver: BreakpointObserver, private cdRef: ChangeDetectorRef,
              private formBuilder: UntypedFormBuilder, private authUserService: AuthUserService) {
    this.getState = this.store.select(selectReservationState);
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
    this.breakpointObserver.observe(Object.values(CALENDAR_RESPONSIVE).map(({ breakpoint }) => breakpoint))
      .pipe(takeUntil(this.destroy$)).subscribe((state: BreakpointState) => {
      const foundBreakpoint = Object.values(CALENDAR_RESPONSIVE).find(({ breakpoint }) => !!state.breakpoints[breakpoint]);
      if (foundBreakpoint) {
        this.daysInWeek = foundBreakpoint.daysInWeek;
      } else {
        this.daysInWeek = 7;
      }
      this.cdRef.markForCheck();
    });
    this.locale = this.translate.currentLang;
    this.language = this.translate.currentLang;

    this.authUserServiceSubscription = this.authUserService.authUser.subscribe(value => {
      this.professionalId = value.professionalId;
      const darkMode: boolean = value.isDarkMode;
      if (this.isDarkMode !== undefined && darkMode !== this.isDarkMode) {
        this.fillData(darkMode);
      }
      this.isDarkMode = darkMode;
      this.isRoomAdmin = value.isRoomAdmin;
    });
    this.maxDate = addMonths(getNow(), MAX_RESERVATION_MONTH);
    this.minDate = new Date(2023, 0, 1);
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

  private get searchDate(): Date {
    return this.totalDays ? addDays(this.viewDate, Math.floor(this.daysInWeek / 2)) : this.getRelevantWednesday(this.viewDate);
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

  displayFnOffice(office: IOffice): string {
    return office ? `${ office.name }` : '';
  }

  displayFnRoom(room: IRoom): string {
    return room.address ? room.address.name : '';
  }

  displayFnProfessional(professional: IUser): string {
    return professional?.displayName ? professional.displayName : '';
  }

  keyDownHandler(event: any, form: UntypedFormControl): void {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  }

  keyDownOffice(event: any): void {
    if (event.code === 'Backspace') {
      this.office.setValue('');
      this.keyDownRoom(event);
    }
  }

  keyDownRoom(event: any): void {
    if (event.code === 'Backspace') {
      this.professionalList = undefined;
      this.roomId = undefined;
      this.professionalSelectedId = undefined;
      this.keyDownHandler(event, this.professional);
      this.keyDownHandler(event, this.room);
    }
  }

  view(event: CalendarEvent): void {
    if (event.id) {
      this.router.navigate([event.id]);
    }
  }

  segmentClick(date: Date, room?: IRoom): void {
    const data = { date, room, professional: this.professional.value };
    if (date && room && this.dateIsValid(date)) {
      executeDialogNoWidth(this.dialog, CalendarDialogComponent, null, result => {
        if (result) {
          this.router.navigate([this.language].concat(result.split(',')), { state: data });
        }
      });
    }
  }

  selectDate(event: any): void {
    this.changeDate(newDate(event.value));
    this.getReservations();
  }

  beforeMonthViewRender({ header }: any): void {
    header.forEach((day: any) => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
  }

  eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
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
  }

  private createForm(): void {
    this.officeForm = this.formBuilder.group({
      office: this.office,
      room: this.room,
      professional: this.professional
    });
    this.valueChanges();
  }

  private valueChanges(): void {
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
  }

  private createFilters(): void {
    this.filteredOffice = this.office.valueChanges.pipe(startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterOffice(name) : this.offices ? this.offices.slice() : this.offices)
    );
    this.filteredRoom = this.room.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(addressName => addressName ? this.filterRoom(addressName) : this.roomList ? this.roomList.slice() : this.roomList)
    );
    this.filteredProfessional = this.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(addressName => addressName ? this.filterProfessional(addressName) : this.professionalList
        ? this.professionalList.slice() : this.professionalList)
    );
  }

  private changeDate(date: Date): void {
    const newDate = createNewDate(date, this.viewDate.getHours(), this.viewDate.getMinutes());
    this.viewDate = this.totalDays ? addDays(newDate, -Math.floor(this.daysInWeek / 2)) : newDate;
  }

  private dateIsValid(date: Date): boolean {
    return isBetween(this.today, this.maxDate, date);
  }

  private addReservations(rr: IRoomReservation, darkMode: boolean): void {
    const reservations: IReservationAll[] = rr.reservations;
    this.calendar = new Calendar(rr.room, []);
    reservations.forEach(it => {
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
        const draggable = [States.approved, States.created, States.partiallyPaid, States.paid].includes(it.state as States);
        const event = calendarEvent(detail, color, start, darkMode, end, `${ this.language }/reservation/${ it.id }`, meta, draggable);
        let events;
        if (this.calendar) {
          events = [...this.calendar.events, event];
        } else {
          events = [event];
        }
        this.calendar = new Calendar(rr.room, events);
      }
    });
  }

  private addUnavailableList(rr: IRoomReservation, darkMode: boolean): void {
    const unavailableList: IUnavailableAll[] = rr.unavailableList;
    let recurringEvents: any[] = [];
    unavailableList.forEach(it => {
      if (it.duration || it.allDay) {
        const startDate = newDateTimestamp(it.timestamp, rr.room.timeZone);
        const start = it.allDay ? createNewDate(startDate) : startDate;
        const duration = getDuration(it.allDay, it.duration);
        const id = it.id;
        const allDay = it.allDay;
        const professionalId = it.professional.id;
        const title = this.translate.instant('RESERVATION.EVENT.UNAVAILABLE', {
          description: it.description ? it.description : '',
          professionalName: it.professional.displayName
        });
        let path = 'unavailable/';
        if (it.type === 'BLOCK_AGENDA') {
          path += 'block-agenda/';
        }
        if (it.repeat === 'NONE') {
          if (!greaterOrEqualsThan(start, this.maxDate)) {
            const data = { id, allDay, title, path, duration, professionalId };
            this.validateUnavailableEvent(rr.room, start, data, darkMode);
          }
        } else {
          const sundayViewDate = getPreviousSunday(this.viewDate);
          const calendarStart = greaterOrEqualsThan(sundayViewDate, start) ? sundayViewDate : start;
          recurringEvents = [...recurringEvents, getFrequency(it.repeat, calendarStart, it.id, title, this.daysInWeek, 'UNAVAILABLE',
            'unavailable', it.end, getDurationOrUndefined(it.duration), it.allDay, professionalId)];
        }
      }
    });

    recurringEvents.forEach(recurring => recurring.rule.all().forEach((date: Date) =>
      this.validateUnavailableEvent(rr.room, date, recurring, darkMode)));
  }

  private addBirthdays(rr: IRoomReservation, darkMode: boolean): void {
    const birthdays: IUserAll[] = rr.birthdays;
    birthdays.forEach(it => {
      if (it.dob) {
        const detail = this.translate.instant('RESERVATION.EVENT.BIRTHDAY', {
          customerName: it.displayName
        });
        const startDate = newDateTimestamp(it.dob);
        startDate.setFullYear(getNow().getFullYear());
        const color = findStateColor('BIRTHDAY', darkMode);
        const event = allDayEvent(detail, color, startDate, darkMode, `${ this.language }/users/${ it.id }`);
        if (this.calendar) {
          this.calendar.events = [...this.calendar.events, event];
        }
      }
    });
  }

  private addNotes(rr: IRoomReservation, darkMode: boolean): void {
    const notes: INoteAll[] = rr.notes;
    let recurringEvents: any[] = [];
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
        recurringEvents = [...recurringEvents, getFrequency(it.repeat, startDate, it.id, title, this.daysInWeek, state, path)];
      }
    });

    recurringEvents.forEach(recurring => recurring.rule.all().forEach((date: Date) => this.createNoteEvent(recurring.title,
      recurring.state, recurring.path, date, darkMode)));
  }

  private createNoteEvent(title: string, state: string, path: string, date: Date, darkMode: boolean): void {
    const color = findStateColor(state, darkMode);
    const event = allDayEvent(title, color, date, darkMode, path);
    if (this.calendar && event) {
      this.calendar.events = [...this.calendar.events, event];
    }
  }

  private validateUnavailableEvent(room: IRoomAll, start: Date, recurring: any, darkMode: boolean): void {
    const [startSearch, endSearch] = searchDates(recurring.allDay, start, recurring.duration);
    if (this.calendar) {
      const calendar = this.calendar;
      let events = calendar.events;
      const overlapEvent = getOverlapEvent(events, startSearch, endSearch);
      if (overlapEvent.length > 0) {
        overlapEvent.forEach(value => {
          if (value.id !== 'NOT_WORKING_ALL_DAY') {
            events = events.filter(ev => ev !== value);
            if (value.end) {
              if (startSearch < value.start && endSearch < value.end) {
                value.start = endSearch;
                events = [...events, value];
              } else if (startSearch > value.start && endSearch > value.end) {
                value.end = startSearch;
                events = [...events, value];
              }
            }
            if (!events.find(ce => ce.id === recurring.path && isSameDay(value.start, ce.start))) {
              this.createUnavailableEvent(room, events, calendar.day, recurring, startSearch, endSearch, darkMode);
            }
          }
        });
      } else {
        this.createUnavailableEvent(room, events, calendar.day, recurring, startSearch, endSearch, darkMode);
      }
    }
  }

  private createUnavailableEvent(room: IRoomAll, events: CalendarEvent[], day: any, recurring: any, start: Date,
                                 end: Date, darkMode: boolean): void {
    const color = findStateColor('DEFAULT', darkMode);
    const meta = new Meta(!recurring.allDay, room.timeZone);
    events = [...events, calendarEvent(recurring.title, color, start, darkMode, end, recurring.path + recurring.id, meta)];
    const calendar = new Calendar(room, events);
    calendar.day = day;
    this.calendar = calendar;
  }

  private getRelevantWednesday(date: Date): Date {
    const dayOfWeek = date.getDay();

    const wednesday: Date = new Date(date);
    wednesday.setDate(date.getDate() - (dayOfWeek - 3));
    return wednesday;
  }

  private subscribe(): void {
    this.getState.pipe(takeUntil(this.subscription)).subscribe((state) => {
      this.offices = Array.from(createRoomOffice(state.rooms)?.values() || []);
      if (this.offices && this.roomId && !this.office.value) {
        this.office.setValue(this.offices?.find(office => office.rooms?.find(o => o.id === this.roomId) ? office : undefined));
      } else if (this.offices && this.offices.length === 1) {
        this.office.setValue(this.offices[0]);
      }
      if (state.data && state.data.room && state.data.reservations) {
        this.data = state.data;
        this.fillData(this.isDarkMode);
      }
    });
  }

  private fillData(darkMode: boolean = false): void {
    if (this.data) {
      this.addReservations(this.data, darkMode);
      if (this.calendar) {
        const timeZone = this.calendar.room.timeZone;
        const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, exclude } = getAvailability(this.calendar.room);
        const { min, max } = getStartEndDay(monday, tuesday, wednesday, thursday, friday, saturday, sunday, timeZone);
        this.calendar.day = new Day(min, max, getNow(), exclude, 1);
        const unavailable = this.translate.instant('RESERVATION.EVENT.MESSAGE.UNAVAILABLE');
        const lunch = this.translate.instant('RESERVATION.EVENT.MESSAGE.LUNCH');
        const notWorking = this.translate.instant('RESERVATION.EVENT.MESSAGE.OUT_OF_WORK');
        const date = this.dateIsValid(this.searchDate) ? this.searchDate : this.viewDate;
        this.calendar.events = this.calendar.events.concat(fillNotAvailable(unavailable, lunch, notWorking, date,
          sunday, saturday, friday, thursday, wednesday, tuesday, monday, darkMode, plusDays(date, this.daysInWeek), timeZone));
        this.addUnavailableList(this.data, darkMode);
        this.addBirthdays(this.data, darkMode);
        this.addNotes(this.data, darkMode);
      }
    }
  }

  private clean(): void {
    this.calendar = undefined;
    this.store.dispatch(
      new fromActionsReservation.Clean()
    );
  }

  private getReservations(): void {
    const payload = {
      days: this.daysInWeek,
      date: this.searchDate,
      roomId: this.roomId,
      professionalId: this.professionalSelectedId
    };
    this.store.dispatch(
      new fromActionsReservation.GetAllGroupingByRoom(payload)
    );
  }

  private getRoomList(): void {
    this.store.dispatch(
      new fromActionsReservation.FindRooms()
    );
  }

  private filterOffice(name: string): IOffice[] | undefined {
    const filterValue = name.toLowerCase();

    return this.offices?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterRoom(addressName: string): IRoom[] | undefined {
    const filterValue = addressName.toLowerCase();

    return this.roomList?.filter(option => option.address?.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterProfessional(name: string): IUser[] | undefined {
    const filterValue = name.toLowerCase();

    return this.professionalList?.filter(option => option.displayName?.toLowerCase().indexOf(filterValue) === 0);
  }
}
