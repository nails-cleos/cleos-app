import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectReservationState } from '../../store/app.states';
import { Observable, Subject } from 'rxjs';
import * as fromActionsReservation from '../../store/reservation.actions';
import { Calendar, Day, ICalendar, IReservationAll, IRoomReservation, MAX_RESERVATION_MONTH } from '../../interfaces/reservation';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
  reservationDuration,
  startOfPeriod,
  subPeriod
} from '../../util/dates';
import { IRoom, IRoomAll } from '../../interfaces/room';
import { createRecurringEvent, fillNotAvailable, getOverlapEvent, Meta, newEvent } from '../../util/event';
import { Router } from '@angular/router';
import { CalendarEvent } from 'angular-calendar';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { IUserAll } from '../../interfaces/user';
import { IUnavailableAll } from '../../interfaces/unavailable';
import { getUserName, roomName } from '../../util/helper';
import { addMonths } from 'date-fns';
import { findStateColor, isDarkMode } from '../../util/theme';
import { takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {
  @ViewChild('picker') picker: any;

  data?: IRoomReservation[];
  calendar?: Map<string, ICalendar>;
  daysInWeek = 7;
  hourSegments = 4;
  viewDate: Date = getNow();
  today: Date = getNow();
  maxDate: Date;
  locale: string;
  professionalId?: string;
  prevBtnDisabled = false;
  nextBtnDisabled = false;

  private isDarkMode?: boolean;
  private selectView: CalendarPeriod = 'day';
  private getState: Observable<any>;
  private destroy$ = new Subject();
  private subscription = new Subject();

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private store: Store<AppState>,
              private router: Router, private breakpointObserver: BreakpointObserver, private cdRef: ChangeDetectorRef) {
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
    this.breakpointObserver.observe(Object.values(CALENDAR_RESPONSIVE).map(({breakpoint}) => breakpoint))
      .pipe(takeUntil(this.destroy$)).subscribe((state: BreakpointState) => {
      const foundBreakpoint = Object.values(CALENDAR_RESPONSIVE).find(({breakpoint}) => !!state.breakpoints[breakpoint]);
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

  ngOnInit(): void {
    this.subscribe();
    this.clean();
    this.getReservations();
  }

  ngOnDestroy(): void {
    this.subscription.next();
    this.destroy$.next();
  }

  view(event: CalendarEvent): void {
    if (event.id) {
      this.router.navigate([event.id]);
    }
  }

  segmentClick(date: Date, room?: IRoom): void {
    const data = {date, room};
    if (date && room && this.dateIsValid(date)) {
      const dialogRef = this.dialog.open(CalendarDialogComponent);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate(result.split(','), {state: data});
        }
      });
    }
  }

  selectDate(event: any): void {
    this.changeDate(newDate(event.value));
    this.getReservations();
  }

  increment(): void {
    this.picker.select(addPeriod(this.selectView, this.viewDate, this.daysInWeek));
  }

  decrement(): void {
    this.picker.select(subPeriod(this.selectView, this.viewDate, this.daysInWeek));
  }

  beforeMonthViewRender({header}: any): void {
    header.forEach((day: any) => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
  }

  getRoomName(room: IRoomAll): string {
    return roomName(room);
  }

  private changeDate(date: Date): void {
    this.viewDate = date;
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
    this.calendar?.set(rr.room.id, new Calendar(rr.room, []));
    reservations.forEach(it => {
      if (it.product.duration) {
        const start = newDate(it.start);
        const duration = reservationDuration(it);
        const end = createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
        const detail = this.translate.instant('RESERVATION.EVENT.DETAIL', {
          customerName: getUserName(it.customer),
          productName: it.product.name
        });

        const color = findStateColor(it.state, darkMode);
        const meta = new Meta(true);
        const event = newEvent(detail, color, start, end, '#000', `reservation/${it.id}`, meta);
        if (event) {
          const calendar = this.calendar?.get(rr.room.id);
          let events;
          if (calendar) {
            events = [...calendar.events, event];
          } else {
            events = [event];
          }
          this.calendar?.set(rr.room.id, new Calendar(rr.room, events));
        }
      }
    });
  }

  private addUnavailableList(rr: IRoomReservation, darkMode: boolean): void {
    const unavailableList: IUnavailableAll[] = rr.unavailableList;
    let recurringEvents: any[] = [];
    unavailableList.forEach(it => {
      if (it.duration || it.allDay) {
        const startDate = newDate(it.start);
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
    const calendar: ICalendar | undefined = this.calendar?.get(room.id);
    if (calendar) {
      let events = calendar.events;
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
            if (events.find(ce => ce.id !== `unavailable/${it.id}`)) {
              this.createUnavailableEvent(room, events, calendar.day, it, start, end, darkMode);
            }
          }
        });
      } else {
        this.createUnavailableEvent(room, events, calendar.day, it, start, end, darkMode);
      }
    }
  }

  private createUnavailableEvent(room: IRoomAll, events: CalendarEvent[], day: any, it: IUnavailableAll, start: Date,
                                 end: Date, darkMode: boolean): void {
    const detail = this.translate.instant('RESERVATION.EVENT.UNAVAILABLE', {
      description: it.description ? it.description : ''
    });

    const color = findStateColor('DEFAULT', darkMode);
    const meta = new Meta(!it.allDay);
    const event = newEvent(detail, color, start, end, '#000', `unavailable/${it.id}`, meta);
    if (event) {
      events = [...events, event];
      const calendar = new Calendar(room, events);
      calendar.day = day;
      this.calendar?.set(room.id, calendar);
    }
  }

  private subscribe(): void {
    this.getState.pipe(takeUntil(this.subscription)).subscribe((state) => {
      if (state.data && Array.isArray(state.data) && state.data[0] &&
        state.data[0].room && state.data[0].reservations) {
        this.data = state.data;
        this.fillData(this.isDarkMode);
      }
    });
  }

  private fillData(darkMode: boolean = false): void {
    if (this.data) {
      this.calendar = new Map<string, ICalendar>();
      this.data.forEach((value: IRoomReservation) => this.addReservations(value, darkMode));
      this.calendar.forEach(calendar => {
        const {week, saturday, sunday, exclude} = getAvailability(calendar.room);
        const {min, max} = getStartEndDay(week, saturday, sunday);
        calendar.day = new Day(min.getHours() - 1, min.getMinutes(),
          max.getHours() + 1, max.getMinutes(), exclude);
        const unavailable = this.translate.instant('RESERVATION.EVENT.MESSAGE.UNAVAILABLE');
        const lunch = this.translate.instant('RESERVATION.EVENT.MESSAGE.LUNCH');
        const notWorking = this.translate.instant('RESERVATION.EVENT.MESSAGE.OUT_OF_WORK');
        calendar.events = calendar.events.concat(fillNotAvailable(unavailable, lunch, notWorking, this.viewDate,
          sunday, saturday, week, darkMode, this.maxDate));
      });
      this.data.forEach((value: IRoomReservation) => this.addUnavailableList(value, darkMode));
    }
  }

  private clean(): void {
    this.calendar = new Map<string, ICalendar>();
    this.store.dispatch(
      new fromActionsReservation.Clean()
    );
  }

  private getReservations(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllGroupingByRoom({days: this.daysInWeek, date: this.viewDate})
    );
  }
}

@Component({
  selector: 'app-calendar-dialog',
  templateUrl: './calendar-dialog.component.html',
  styleUrls: ['./calendar-dialog.component.scss']
})
export class CalendarDialogComponent {

  radio: FormControl = new FormControl('reservation');

  constructor(public dialogRef: MatDialogRef<CalendarDialogComponent>) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
