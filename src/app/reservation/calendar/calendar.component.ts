import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectReservationState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsReservation from '../../store/reservation.actions';
import {
  Calendar,
  Day,
  ICalendar,
  IReservationAll,
  IRoomReservation,
  MAX_RESERVATION_MONTH
} from '../../interfaces/reservation';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import {
  addPeriod,
  CalendarPeriod,
  convertDuration,
  createDate,
  createNewDate,
  endOfPeriod,
  formatTime,
  getAvailability,
  getDiffDay,
  getNow,
  getStartEndDay,
  greaterOrEqualsThan,
  IDuration,
  isBetween,
  newDate,
  plusDay,
  startOfPeriod,
  subPeriod
} from '../../util/dates';
import { IRoom, IRoomAll } from '../../interfaces/room';
import { fillNotAvailable, getOverlapEvent, newEvent } from '../../util/event';
import { Router } from '@angular/router';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { IUserAll } from '../../interfaces/user';
import { IUnavailableAll } from '../../interfaces/unavailable';
import { getUserName } from '../../util/helper';
import { addMonths } from 'date-fns';
import { findStateColor, isDarkMode } from '../../util/theme';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {
  @ViewChild('picker') picker: any;

  getState: Observable<any>;
  subscription: Subscription | undefined;

  data: IRoomReservation[] | undefined;
  calendar: Map<string, ICalendar> = new Map<string, ICalendar>();
  dayStart: Date = createDate(9);
  dayEnd: Date = createDate(18);
  daysInWeek = 7;
  lessDays = 3;
  hourSegments = 4;
  viewDate: Date = getNow();
  today: Date = getNow();
  maxDate: Date;
  calendarView: CalendarView = CalendarView.Week;
  selectView: CalendarPeriod = 'week';
  days = 0;
  smallScreen: boolean | undefined;
  locale: string;
  professionalId: string | undefined;

  prevBtnDisabled = false;
  nextBtnDisabled = false;

  isDarkMode = false;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private store: Store<AppState>,
              private router: Router, private breakpointObserver: BreakpointObserver) {
    this.getState = this.store.select(selectReservationState);
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      this.smallScreen = result.matches;
      if (this.smallScreen) {
        this.daysInWeek = 3;
        this.selectView = 'day';
        this.calendarView = CalendarView.Day;
        this.lessDays = 1;
      }
    });
    const userLang = this.translate.currentLang;
    const index = userLang.indexOf('-');
    this.locale = index === -1 ? userLang : userLang.substr(0, index);

    this.store.select(selectAuthState).subscribe((state: any) => {
      const user: IUserAll = state.user;
      this.professionalId = user.id;
      this.isDarkMode = isDarkMode(user.theme);
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
    this.subscription?.unsubscribe();
  }

  view(event: CalendarEvent): void {
    if (event.id) {
      this.router.navigate([event.id]);
    }
  }

  segmentClick(date: Date, room?: IRoom): void {
    if (date && room && this.dateIsValid(date)) {
      const data = {date, room};
      this.router.navigate(['reservation'], {state: data});
    }
  }

  selectDate(event: any): void {
    this.changeDate(newDate(event.value));
  }

  increment(): void {
    this.changeDate(addPeriod(this.selectView, this.viewDate, 1));
    this.picker.select(this.viewDate);
  }

  decrement(): void {
    this.changeDate(subPeriod(this.selectView, this.viewDate, 1));
    this.picker.select(this.viewDate);
  }

  beforeMonthViewRender({header}: any): void {
    header.forEach((day: any) => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
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

  private addReservations(rr: IRoomReservation): void {
    const reservations: IReservationAll[] = rr.reservations;
    this.calendar.set(rr.room.id, new Calendar(rr.room, []));
    reservations.forEach(it => {
      if (it.product.duration) {
        const start = newDate(it.start);
        const duration = convertDuration(it.product.duration);
        const end = createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
        const detail = this.translate.instant('RESERVATION.EVENT.DETAIL', {
          customerName: getUserName(it.customer),
          productName: it.product.name,
          duration: formatTime(duration.hour, duration.minute)
        });

        const color = findStateColor(it.state, this.isDarkMode);
        const event = newEvent(detail, color, start, end, '#000', `reservation/${it.id}`);
        if (event) {
          const calendar = this.calendar.get(rr.room.id);
          let events;
          if (calendar) {
            events = [...calendar.events, event];
          } else {
            events = [event];
          }
          this.calendar.set(rr.room.id, new Calendar(rr.room, events));
        }
      }
    });
  }

  private addUnavailableList(rr: IRoomReservation): void {
    const unavailableList: IUnavailableAll[] = rr.unavailableList;
    const days = 56;
    unavailableList.forEach(it => {
      if (it.duration) {
        const start = newDate(it.start);
        const duration = convertDuration(it.duration);
        switch (it.repeat) {
          case 'NONE':
            if (!greaterOrEqualsThan(start, this.maxDate)) {
              this.validateUnavailableEvent(rr.room, start, duration, it);
            }
            break;
          case 'ONCE_A_WEEK':
            for (let i = 0; i < days; i++) {
              const onceWeekDate = plusDay(start, i * 7);
              if (greaterOrEqualsThan(onceWeekDate, this.maxDate)) {
                break;
              }
              this.validateUnavailableEvent(rr.room, onceWeekDate, duration, it);
            }
            break;
          case 'EVERY_DAY':
            for (let i = 0; i < days * 7; i++) {
              const everyDayDate = plusDay(start, i);
              if (greaterOrEqualsThan(everyDayDate, this.maxDate)) {
                break;
              }
              this.validateUnavailableEvent(rr.room, everyDayDate, duration, it);
            }
            break;
        }
      }
    });
  }

  private validateUnavailableEvent(room: IRoomAll, start: Date, duration: IDuration, it: IUnavailableAll): void {
    const end = createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
    const calendar: ICalendar | undefined = this.calendar.get(room.id);
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
            this.createUnavailableEvent(room, events, calendar.day, it.id, start, end, duration, it.description);
          }
        });
      } else {
        this.createUnavailableEvent(room, events, calendar.day, it.id, start, end, duration, it.description);
      }
    }
  }

  private createUnavailableEvent(room: IRoomAll, events: CalendarEvent[], day: any, id: string, start: Date, end: Date,
                                 duration: IDuration, description?: string): void {
    const detail = this.translate.instant('RESERVATION.EVENT.UNAVAILABLE', {
      description: description ? description : '',
      duration: formatTime(duration.hour, duration.minute)
    });

    const color = findStateColor('DEFAULT', this.isDarkMode);
    const event = newEvent(detail, color, start, end, '#000', `unavailable/${id}`);
    if (event) {
      events = [...events, event];
      const calendar = new Calendar(room, events);
      calendar.day = day;
      this.calendar.set(room.id, calendar);
    }
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state.data && Array.isArray(state.data) && state.data[0] &&
        state.data[0].room && state.data[0].reservations) {
        this.data = state.data;
        state.data.forEach((value: IRoomReservation) => this.addReservations(value));
        this.calendar.forEach(calendar => {
          const {week, saturday, sunday} = getAvailability(calendar.room);
          const {min, max} = getStartEndDay(week, saturday, sunday);
          calendar.day = new Day(min.getHours() - 1, min.getMinutes(), max.getHours() + 1, max.getMinutes());
          const unavailable = this.translate.instant('RESERVATION.EVENT.MESSAGE.UNAVAILABLE');
          const lunch = this.translate.instant('RESERVATION.EVENT.MESSAGE.LUNCH');
          const notWorking = this.translate.instant('RESERVATION.EVENT.MESSAGE.OUT_OF_WORK');
          calendar.events = calendar.events.concat(fillNotAvailable(unavailable, lunch, notWorking,
            getDiffDay(this.maxDate, this.today), this.viewDate, sunday, saturday, week, this.isDarkMode));
        });
        state.data.forEach((value: IRoomReservation) => this.addUnavailableList(value));
      }
    });
  }

  private clean(): void {
    this.calendar = new Map<string, ICalendar>();
    this.store.dispatch(
      new fromActionsReservation.Clean()
    );
  }

  private getReservations(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllGroupingByRoom()
    );
  }
}
