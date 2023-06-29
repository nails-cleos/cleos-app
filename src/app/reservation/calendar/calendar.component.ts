import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectReservationState } from '../../store/app.states';
import { Observable, Subject } from 'rxjs';
import * as fromActionsReservation from '../../store/reservation.actions';
import { Calendar, Day, ICalendar, IReservationAll, IRoomReservation, MAX_RESERVATION_MONTH } from '../../interfaces/reservation';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import {
  addPeriod,
  CalendarPeriod,
  createNewDate,
  endOfPeriod,
  getAvailability,
  getDuration,
  getNow,
  getStartEndDay,
  greaterOrEqualsThan,
  IDuration,
  isBetween,
  newDate,
  newDateTimestamp,
  reservationDuration,
  startOfPeriod,
  subPeriod
} from '../../util/dates';
import { IRoom, IRoomAll } from '../../interfaces/room';
import { createBullet, createRecurringEvent, fillNotAvailable, getOverlapEvent, Meta, newEvent } from '../../util/event';
import { Router } from '@angular/router';
import { CalendarEvent } from 'angular-calendar';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { IUser, IUserAll } from '../../interfaces/user';
import { IUnavailableAll } from '../../interfaces/unavailable';
import { createRoomOffice, executeDialogNoWidth, getFullUserName, getUserName } from '../../util/helper';
import { addMonths } from 'date-fns';
import { findStateColor, isDarkMode } from '../../util/theme';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { IOffice } from '../../interfaces/office';
import { requireMatch } from '../../util/validators';
import { CalendarDialogComponent } from '../../shared/dialog/calendar/calendar-dialog.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {
  @ViewChild('picker') picker: any;

  data?: IRoomReservation;
  calendar?: ICalendar;
  daysInWeek = 7;
  hourSegments = 4;
  viewDate: Date = getNow();
  today: Date = createNewDate(getNow());
  maxDate: Date;
  locale: string;
  professionalId?: string;
  prevBtnDisabled = false;
  nextBtnDisabled = false;

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

  private isDarkMode?: boolean;
  private selectView: CalendarPeriod = 'day';
  private getState: Observable<any>;
  private destroy$ = new Subject();
  private subscription = new Subject();
  private roomId?: string;
  private professionalSelectedId?: string;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private store: Store<AppState>,
              private router: Router, private breakpointObserver: BreakpointObserver, private cdRef: ChangeDetectorRef,
              private formBuilder: UntypedFormBuilder) {
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

    this.store.select(selectAuthState).subscribe((state: any) => {
      const user: IUserAll = state.user;
      this.professionalId = user.id;
      const darkMode: boolean = isDarkMode(user.theme);
      if (this.isDarkMode !== undefined && darkMode !== this.isDarkMode) {
        this.fillData(darkMode);
      }
      this.isDarkMode = darkMode;
    });
    this.maxDate = addMonths(getNow(), MAX_RESERVATION_MONTH);
    this.dateOrViewChanged();
  }

  get search(): void {
    return this.getReservations();
  }

  get increment(): void {
    return this.picker.select(addPeriod(this.selectView, this.viewDate, this.daysInWeek));
  }

  get decrement(): void {
    return this.picker.select(subPeriod(this.selectView, this.viewDate, this.daysInWeek));
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
  }

  displayFnOffice(office: IOffice): string {
    return office ? `${ office.name }` : '';
  }

  displayFnRoom(room: IRoom): string {
    return room.address ? room.address.name : '';
  }

  displayFnProfessional(professional: IUser): string {
    return professional ? getFullUserName(professional) : '';
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
          this.router.navigate(result.split(','), { state: data });
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
    this.viewDate = createNewDate(date, this.viewDate.getHours(), this.viewDate.getMinutes());
    this.dateOrViewChanged();
  }

  private dateOrViewChanged(): void {
    this.prevBtnDisabled = !this.dateIsValid(
      endOfPeriod(this.selectView, subPeriod(this.selectView, this.viewDate, 1))
    );
    this.nextBtnDisabled = !this.dateIsValid(
      startOfPeriod(this.selectView, addPeriod(this.selectView, this.viewDate, 1))
    );
    if (this.viewDate < this.today) {
      this.changeDate(this.today);
    } else if (this.viewDate > this.maxDate) {
      this.changeDate(this.maxDate);
    }
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
          customerName: getUserName(it.customer),
          professionalName: getUserName(it.professional),
          treatments
        });

        const color = findStateColor(it.state, darkMode);
        const meta = new Meta(true, it.room.timeZone);
        const event = newEvent(detail, color, start, end, darkMode, `reservation/${ it.id }`, meta);
        if (event) {
          let events;
          if (this.calendar) {
            events = [...this.calendar.events, event];
          } else {
            events = [event];
          }
          this.calendar = new Calendar(rr.room, events);
        }
      }
    });
  }

  private addUnavailableList(rr: IRoomReservation, darkMode: boolean): void {
    const unavailableList: IUnavailableAll[] = rr.unavailableList;
    let recurringEvents: any[] = [];
    unavailableList.forEach(it => {
      if (it.duration || it.allDay) {
        const startDate = newDateTimestamp(it.timestamp);
        const start = it.allDay ? createNewDate(startDate) : startDate;
        const duration = getDuration(it.allDay, it.duration);
        if (it.repeat === 'NONE') {
          if (!greaterOrEqualsThan(start, this.maxDate)) {
            this.validateUnavailableEvent(rr.room, start, duration, it, darkMode);
          }
        } else {
          recurringEvents = [...recurringEvents, createRecurringEvent(start, this.today, it, duration)];
        }
      }
    });

    recurringEvents.forEach(recurring => {
      recurring.rrule.all().forEach((date: Date) =>
        this.validateUnavailableEvent(rr.room, date, recurring.duration, recurring.it, darkMode));
    });
  }

  private validateUnavailableEvent(room: IRoomAll, start: Date, duration: IDuration, it: IUnavailableAll,
                                   darkMode: boolean): void {
    const end = createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
    if (this.calendar) {
      let events = this.calendar.events;
      const overlapEvent = getOverlapEvent(events, start, end);
      if (overlapEvent.length > 0) {
        overlapEvent.forEach(value => {
          if (value.id !== 'NOT_WORKING_ALL_DAY') {
            events = events.filter(ev => ev !== value);
            if (value.end) {
              if (start < value.start && end < value.end) {
                value.start = end;
                events = [...events, value];
              } else if (start > value.start && end > value.end) {
                value.end = start;
                events = [...events, value];
              }
            }
            if (events.find(ce => ce.id !== `unavailable/${ it.id }`)) {
              this.createUnavailableEvent(room, events, this.calendar?.day, it, start, end, darkMode);
            }
          }
        });
      } else {
        this.createUnavailableEvent(room, events, this.calendar.day, it, start, end, darkMode);
      }
    }
  }

  private createUnavailableEvent(room: IRoomAll, events: CalendarEvent[], day: any, it: IUnavailableAll, start: Date,
                                 end: Date, darkMode: boolean): void {
    const detail = this.translate.instant('RESERVATION.EVENT.UNAVAILABLE', {
      description: it.description ? it.description : '',
      professionalName: getUserName(it.professional)
    });

    const color = findStateColor('DEFAULT', darkMode);
    const meta = new Meta(!it.allDay, room.timeZone);
    const event = newEvent(detail, color, start, end, darkMode, `unavailable/${ it.id }`, meta);
    if (event) {
      events = [...events, event];
      const calendar = new Calendar(room, events);
      calendar.day = day;
      this.calendar = calendar;
    }
  }

  private subscribe(): void {
    this.getState.pipe(takeUntil(this.subscription)).subscribe((state) => {
      this.offices = Array.from(createRoomOffice(state.rooms)?.values() || []);
      if (this.offices && this.roomId && !this.office.value) {
        this.office.setValue(this.offices?.find(office => office.rooms?.find(o => o.id === this.roomId) ? office : undefined));
      } else if (this.offices && this.offices.length === 1) {
        this.office.setValue(this.offices[0]);
      }
      if (state.data && state.data && state.data.room && state.data.reservations) {
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
        this.calendar.events = this.calendar.events.concat(fillNotAvailable(unavailable, lunch, notWorking, this.viewDate,
          sunday, saturday, friday, thursday, wednesday, tuesday, monday, darkMode, this.maxDate, timeZone));
        this.addUnavailableList(this.data, darkMode);
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
      date: this.viewDate,
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

    return this.professionalList?.filter(option => getFullUserName(option)?.toLowerCase().indexOf(filterValue) === 0);
  }
}
