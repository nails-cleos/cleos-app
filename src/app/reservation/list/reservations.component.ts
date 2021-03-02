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
import { CalendarEvent } from 'angular-calendar';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements OnInit, OnDestroy {
  getState: Observable<any>;
  subscription: Subscription | undefined;

  isLoading = false;

  data: IRoomReservation[] | undefined;
  calendar: Map<string, ICalendar> = new Map<string, ICalendar>();
  dayStart: Date = new Date(new Date().setHours(9, 0));
  dayEnd: Date = new Date(new Date().setHours(18, 0));
  daysInWeek = 7;
  lessDays = 3;
  hourSegments = 2;
  viewDate: Date = new Date();

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private snackBar: MatSnackBar,
              private store: Store<AppState>, private router: Router) {
    this.getState = this.store.select(selectReservationState);
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

  private subscribe(): void {
    this.subscription = this.getState.subscribe((stateValue) => {
      this.data = stateValue.data;
      if (this.data && Array.isArray(this.data) && this.data[0].room && this.data[0].reservations) {
        this.data.forEach(value => this.addReservations(value));
        this.calendar.forEach(calendar => {
          const {week, saturday, sunday} = ReservationsComponent.getAvailability(calendar.room);
          const {min, max} = GetStartEndDay(week, saturday, sunday);
          calendar.day = new Day(min.getHours() - 1, min.getMinutes(), max.getHours() + 1, max.getMinutes());
          const unavailable = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.UNAVAILABLE');
          const lunch = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.LUNCH');
          const notWorking = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.OUT_OF_WORK');
          calendar.events = calendar.events.concat(FillNotAvailable(unavailable, lunch, notWorking,
            this.daysInWeek, 0, this.viewDate, sunday, saturday, week));

        });
      }
      if (stateValue.errorMessage || stateValue.message) {
        this.snackBar.open(stateValue.errorMessage || stateValue.message, 'OK', {
          duration: 5000
        });
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

  view(event: CalendarEvent): void {
    this.router.navigate(['reservation', event.id]);
  }

  addReservations(rr: IRoomReservation): void {
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

        let color;
        switch (it.state) {
          case 'CREATED':
            color = '#ffecb3';
            break;
          case 'COMPLETED':
            color = '#ede7f6';
            break;
          case 'APPROVED':
          default:
            color = '#dcedc8';
            break;
        }

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

  segmentClick(date: Date, room?: IRoom): void {
    if (date && room) {
      const data = {date, room};
      this.router.navigateByUrl('/reservation', {state: data});
    }
  }
}
