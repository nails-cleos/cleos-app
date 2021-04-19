import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsReservation from '../../store/reservation.actions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Calendar, Day, ICalendar, IReservationAll, IRoomReservation } from '../../interfaces/reservation';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { ConvertDuration, GetStartEndDay } from '../../util/dates';
import { IAvailability, IRoom } from '../../interfaces/room';
import { FillNotAvailable, NewEvent } from '../../util/event';
import { Router } from '@angular/router';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FindStateColor, IState, StateColor } from '../../util/flags';
import { IUserAll } from '../../interfaces/user';

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
  hourSegments = 2;
  viewDate: Date = new Date();
  calendarView: CalendarView = CalendarView.Week;
  selectView = 'WEEK';
  days = 0;
  smallScreen: boolean | undefined;
  locale: string;
  professionalId: string | undefined;

  colors: IState[] = StateColor();

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
        this.hourSegments = 1;
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

  private static getAvailability(room: IRoom): any {
    const week: IAvailability = room.availabilities.filter((el: IAvailability) => el.day === 'WEEK')[0];
    const saturday: IAvailability = room.availabilities.filter((el: IAvailability) => el.day === 'SATURDAY')[0];
    const sunday: IAvailability = room.availabilities.filter((el: IAvailability) => el.day === 'SUNDAY')[0];
    return {week, saturday, sunday};
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
    this.router.navigate(['reservation', event.id]);
  }

  segmentClick(date: Date, room?: IRoom): void {
    if (date && room) {
      const data = {date, room};
      this.router.navigateByUrl('/reservation', {state: data});
    }
  }

  private addReservations(rr: IRoomReservation): void {
    const reservations: IReservationAll[] = rr.reservations;
    this.calendar.set(rr.room.id, new Calendar(rr.room, []));
    reservations.forEach(it => {
      if (it.product.duration) {
        const start = new Date(it.start);
        const duration = ConvertDuration(it.product.duration);
        const end = new Date(new Date(start).setHours(
          start.getHours() + duration.hour, start.getMinutes() + duration.minute)
        );
        const detail = this.translate.instant('RESERVATION.ADD.EVENT.DETAIL', {
          customerName: `${it.customer.firstName} ${it.customer.lastName}`,
          productName: it.product.name,
          duration: `${duration.hour}:${duration.minute}`
        });

        const color = FindStateColor(it.state);
        const event = NewEvent(detail, color, start, end, '#000', it.id);
        const calendar = this.calendar.get(rr.room.id);
        let events;
        if (calendar) {
          events = [...calendar.events, event];
        } else {
          events = [event];
        }
        this.calendar.set(rr.room.id, new Calendar(it.room, events));
      }
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((stateValue) => {
      if (stateValue.data && Array.isArray(stateValue.data) && stateValue.data[0].room && stateValue.data[0].reservations) {
        this.data = stateValue.data;
        stateValue.data.forEach((value: IRoomReservation) => this.addReservations(value));
        this.calendar.forEach(calendar => {
          const {week, saturday, sunday} = CalendarComponent.getAvailability(calendar.room);
          const {min, max} = GetStartEndDay(week, saturday, sunday);
          calendar.day = new Day(min.getHours() - 1, min.getMinutes(), max.getHours() + 1, max.getMinutes());
          const unavailable = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.UNAVAILABLE');
          const lunch = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.LUNCH');
          const notWorking = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.OUT_OF_WORK');
          calendar.events = calendar.events.concat(FillNotAvailable(unavailable, lunch, notWorking,
            56, 0, this.viewDate, sunday, saturday, week));

        });
      }
      if (stateValue.errorMessage || stateValue.message) {
        this.snackBar.open(stateValue.errorMessage || stateValue.message, 'OK', {
          duration: 5000
        });
        if (stateValue.errorMessage) {
          this.error = stateValue.error;
        }
      }
      this.isLoading = stateValue.isLoading;
    });
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
