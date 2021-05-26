import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsReservation from '../../store/reservation.actions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Calendar, Day, ICalendar, IReservationAll, IRoomReservation } from '../../interfaces/reservation';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { convertDuration, getAvailability, getStartEndDay, IDuration } from '../../util/dates';
import { IRoom, IRoomAll } from '../../interfaces/room';
import { fillNotAvailable, getOverlapEvent, newEvent } from '../../util/event';
import { Router } from '@angular/router';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { findStateColor, IState, stateColor } from '../../util/flags';
import { IUserAll } from '../../interfaces/user';
import { IUnavailableAll } from '../../interfaces/unavailable';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {
  getState: Observable<any>;
  subscription: Subscription | undefined;

  isLoading = false;
  error: any;

  data: IRoomReservation[] | undefined;
  calendar: Map<string, ICalendar> = new Map<string, ICalendar>();
  dayStart: Date = new Date(new Date().setHours(9, 0));
  dayEnd: Date = new Date(new Date().setHours(18, 0));
  daysInWeek = 7;
  lessDays = 3;
  hourSegments = 4;
  viewDate: Date = new Date();
  calendarView: CalendarView = CalendarView.Week;
  selectView = 'WEEK';
  days = 0;
  smallScreen: boolean | undefined;
  locale: string;
  professionalId: string | undefined;

  colors: IState[] = stateColor();

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private snackBar: MatSnackBar,
              private store: Store<AppState>, private router: Router, private breakpointObserver: BreakpointObserver) {
    this.getState = this.store.select(selectReservationState);
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      this.smallScreen = result.matches;
      if (this.smallScreen) {
        this.daysInWeek = 3;
        this.selectView = 'DAY';
        this.calendarView = CalendarView.Day;
        this.lessDays = 1;
      }
    });
    const userLang = this.translate.currentLang;
    const index = userLang.indexOf('-');
    this.locale = index === -1 ? userLang : userLang.substr(0, index);
    const token = localStorage.getItem('auth');
    if (token) {
      const user: IUserAll = JSON.parse(token).user;
      this.professionalId = user.id;
    }
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
    if (date && room) {
      const data = {date, room};
      this.router.navigateByUrl('/reservation', {state: data});
    }
  }

  previousWeek(): void {
    this.days -= 7;
  }

  today(): void {
    this.days = 0;
  }

  nextWeek(): void {
    this.days += 7;
  }

  previousDay(): void {
    this.days--;
  }

  nextDay(): void {
    this.days++;
  }

  private addReservations(rr: IRoomReservation): void {
    const reservations: IReservationAll[] = rr.reservations;
    this.calendar.set(rr.room.id, new Calendar(rr.room, []));
    reservations.forEach(it => {
      if (it.product.duration) {
        const start = new Date(it.start);
        const duration = convertDuration(it.product.duration);
        const end = new Date(new Date(start).setHours(
          start.getHours() + duration.hour, start.getMinutes() + duration.minute)
        );
        const detail = this.translate.instant('RESERVATION.ADD.EVENT.DETAIL', {
          customerName: `${it.customer.firstName} ${it.customer.lastName}`,
          productName: it.product.name,
          duration: `${duration.hour}:${duration.minute}`
        });

        const color = findStateColor(it.state);
        const event = newEvent(detail, color, start, end, '#000', `reservation/${it.id}`);
        const calendar = this.calendar.get(rr.room.id);
        let events;
        if (calendar) {
          events = [...calendar.events, event];
        } else {
          events = [event];
        }
        this.calendar.set(rr.room.id, new Calendar(rr.room, events));
      }
    });
  }

  private addUnavailableList(rr: IRoomReservation): void {
    const unavailableList: IUnavailableAll[] = rr.unavailableList;
    const weeks = 56;
    unavailableList.forEach(it => {
      if (it.duration) {
        const start = new Date(it.start);
        const duration = convertDuration(it.duration);
        switch (it.repeat) {
          case 'NONE':
            this.validateUnavailableEvent(rr.room, start, duration, it);
            break;
          case 'ONCE_A_WEEK':
            for (let i = 0; i < weeks; i++) {
              const newDate = new Date(new Date(it.start).setDate(start.getDate() + i * 7));
              this.validateUnavailableEvent(rr.room, newDate, duration, it);
            }
            break;
          case 'EVERY_DAY':
            for (let i = 0; i < weeks * 7; i++) {
              const newDate = new Date(new Date(it.start).setDate(start.getDate() + i));
              this.validateUnavailableEvent(rr.room, newDate, duration, it);
            }
            break;
        }
      }
    });
  }

  private validateUnavailableEvent(room: IRoomAll, start: Date, duration: IDuration, it: IUnavailableAll): void {
    const end = new Date(new Date(start).setHours(
      start.getHours() + duration.hour, start.getMinutes() + duration.minute)
    );
    const calendar: ICalendar | undefined = this.calendar.get(room.id);
    if (calendar) {
      let events = calendar.events;
      const overlapEvent = getOverlapEvent(events, start, end);
      if (overlapEvent.length > 0) {
        overlapEvent.forEach(value => {
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
        });
      }
      this.createUnavailableEvent(room, events, calendar.day, it.id, start, end, duration, it.description);
    }
  }

  private createUnavailableEvent(room: IRoomAll, events: CalendarEvent[], day: any, id: string, start: Date, end: Date,
                                 duration: IDuration, description?: string): void {
    const minutes = duration.minute < 10 ? `0${duration.minute}` : `${duration.minute}`;
    const detail = this.translate.instant('RESERVATION.ADD.EVENT.UNAVAILABLE', {
      description: description ? description : '',
      duration: `${duration.hour}:${minutes}`
    });

    const color = findStateColor('DEFAULT');
    const event = newEvent(detail, color, start, end, '#000', `unavailable/${id}`);
    events = [...events, event];
    const calendar = new Calendar(room, events);
    calendar.day = day;
    this.calendar.set(room.id, calendar);
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((stateValue) => {
      if (stateValue.data && Array.isArray(stateValue.data) && stateValue.data[0] &&
        stateValue.data[0].room && stateValue.data[0].reservations) {
        this.data = stateValue.data;
        stateValue.data.forEach((value: IRoomReservation) => this.addReservations(value));
        this.calendar.forEach(calendar => {
          const {week, saturday, sunday} = getAvailability(calendar.room);
          const {min, max} = getStartEndDay(week, saturday, sunday);
          calendar.day = new Day(min.getHours() - 1, min.getMinutes(), max.getHours() + 1, max.getMinutes());
          const unavailable = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.UNAVAILABLE');
          const lunch = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.LUNCH');
          const notWorking = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.OUT_OF_WORK');
          calendar.events = calendar.events.concat(fillNotAvailable(unavailable, lunch, notWorking,
            56, 0, this.viewDate, sunday, saturday, week));
        });
        stateValue.data.forEach((value: IRoomReservation) => this.addUnavailableList(value));
      }
      if (stateValue.errorMessage || stateValue.message) {
        this.snackBar.open(stateValue.errorMessage || stateValue.message, 'OK', {
          duration: 5000
        });
        if (stateValue.errorMessage) {
          this.error = stateValue.error;
        }
      }
      if (stateValue.error) {
        this.error = stateValue.error;
      }
      this.isLoading = stateValue.isLoading;
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
