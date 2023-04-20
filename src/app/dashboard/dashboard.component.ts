import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import { Observable, Subscription } from 'rxjs';
import { AppState, selectAuthState, selectDashboardState } from '../store/app.states';
import {
  addPeriod,
  API_LOCALE, newDateTimestamp,
  createNewDate,
  dateToTimestamp,
  endOfPeriod,
  getCurrentTimeZone,
  getEnd,
  getMinutesBetweenTimes,
  getNow,
  getRoomStartEndDay,
  isBetween,
  newDate,
  startOfPeriod,
  subPeriod
} from '../util/dates';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { isDarkMode } from '../util/theme';
import { IProfessionalEvent, IRoomEvents } from '../interfaces/dashboard';
import * as fromActionsDashboard from '../store/dashboard.actions';
import * as fromActionsReservation from '../store/reservation.actions';
import { IProfessional, Professional } from './day-view-scheduler.component';
import { EventColor } from 'calendar-utils';
import { UnavailableRepeatType } from '../interfaces/unavailable';
import { getFrequency } from '../util/event';
import { Day, IReservation, MAX_RESERVATION_MONTH, States } from '../interfaces/reservation';
import { addMonths, isSameDay, isToday } from 'date-fns';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { getProfessionalColor } from '../util/color';
import { CalendarDialogComponent } from '../shared/calendar-dialog/calendar-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('picker') picker: any;

  viewDate: Date = getNow();
  endDate: Date = getNow();
  startDate: Date = getNow();
  today: Date = createNewDate(getNow());
  maxDate: Date;
  day: Day;
  dashboard?: IRoomEvents;

  professionals: IProfessional[] = [];
  events: CalendarEvent[] = [];

  isDarkMode?: boolean;
  locale: string;

  prevBtnDisabled = false;
  nextBtnDisabled = false;

  private readonly approveText: string;
  private readonly startText: string;
  private readonly completeText: string;
  private readonly viewText: string;
  private readonly moreText: string;
  private readonly startedText: string;
  private readonly elapsedText: string;
  private readonly finishInText: string;

  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(private store: Store<AppState>, private readonly translate: TranslateService, private router: Router,
              public dialog: MatDialog) {
    this.getState = this.store.select(selectDashboardState);
    this.store.select(selectAuthState).subscribe((state: any) => {
      const darkMode: boolean = isDarkMode(state.user?.theme);
      if (this.isDarkMode !== undefined && darkMode !== this.isDarkMode) {
        this.createEvents(darkMode);
      }
      this.isDarkMode = darkMode;
    });
    this.locale = translate.currentLang;
    this.day = new Day();
    this.maxDate = addMonths(getNow(), MAX_RESERVATION_MONTH);
    this.approveText = translate.instant('DASHBOARD.ROOM.APPROVE') ?? 'APPROVE';
    this.startText = translate.instant('DASHBOARD.ROOM.START');
    this.completeText = translate.instant('DASHBOARD.ROOM.COMPLETE');
    this.viewText = translate.instant('DASHBOARD.ROOM.VIEW');
    this.moreText = translate.instant('DASHBOARD.ROOM.MORE_INFO');
    this.startedText = translate.instant('DASHBOARD.ROOM.STARTED');
    this.elapsedText = translate.instant('DASHBOARD.ROOM.ELAPSED');
    this.finishInText = translate.instant('DASHBOARD.ROOM.FINISH_IN');
    this.dateOrViewChanged();
  }

  get increment(): void {
    return this.picker.select(addPeriod('day', this.viewDate, 1));
  }

  get decrement(): void {
    return this.picker.select(subPeriod('day', this.viewDate, 1));
  }

  private static getProfessionalImage(professional: IProfessionalEvent): string {
    let image;
    if (professional && professional.imageUrl) {
      if (professional.imageUrl.indexOf('http') >= 0) {
        image = professional.imageUrl;
      } else if (professional.image) {
        image = `data:image/jpg;base64,${ professional.image }`;
      }
    }

    return image || 'assets/icons/icon-512x512.png';
  }

  private static getColor(professional: IProfessionalEvent, isDark: boolean): EventColor {
    return getProfessionalColor(isDark, professional.darkColor, professional.lightColor);
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
    this.getEvents();
  }

  selectDate(event: any): void {
    this.changeDate(newDate(event.value));
    this.getEvents();
  }

  eventTimesChanged({ event, newStart, newEnd }: any): void {
    event.start = newStart;
    event.end = newEnd;
    this.events = [...this.events];
    this.updateEvent(event.id, event.start);
  }

  professionalChanged({ event, newProfessional }: any): void {
    const endTime = event.end ? event.end.getTime() / 1000 : 0;
    const startTime = event.start.getTime() / 1000;
    const time = Math.abs(endTime - startTime);
    const oldIndex = this.professionals.findIndex((professional) => professional.id === event.meta.professional.id);
    if (oldIndex > -1) {
      const professional: IProfessional = this.professionals[oldIndex];
      professional.reservations -= 1;
      professional.time = professional.time ? professional.time - time : 0;
    }
    const newIndex = this.professionals.findIndex((professional) => professional.id === newProfessional.id);
    if (newIndex > -1) {
      const professional = this.professionals[newIndex];
      professional.reservations += 1;
      professional.time = professional.time ? professional.time + time : time;
    }
    this.professionals = [...this.professionals];
    event.color = newProfessional.color;
    event.meta.professional = newProfessional;
    this.events = [...this.events];
    setTimeout(() => this.updateEvent(event.id, undefined, newProfessional.id), 500);
  }

  refreshViewDate(now: Date): void {
    if (isSameDay(now, this.viewDate)) {
      if (now.getSeconds() === 0) {
        this.events = this.events.map((event: CalendarEvent) => this.createTitle(event));
      }
      this.viewDate = now;
    }
  }

  segmentClick(date: Date, professionalId: string): void {
    const data = { date, professionalId, isDashboard: true };
    if (date && professionalId && this.dateIsValid(date)) {
      const dialogRef = this.dialog.open(CalendarDialogComponent);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate(result.split(','), { state: data });
        }
      });
    }
  }

  private createTitle(calendarEvent: CalendarEvent, now: Date = getNow()): CalendarEvent {
    const matcher = calendarEvent.title.match(/(?<=<b>\s*).*?(?=\s*<\/b>)/gs);
    const title = matcher ? `<b>${ matcher[0] }</b>` : calendarEvent.title;

    if (calendarEvent.meta.state === States.started && calendarEvent.end) {
      const dateTime = calendarEvent.meta.started instanceof Date ? calendarEvent.meta.started
        : newDateTimestamp(calendarEvent.meta.started);
      const startTime = calendarEvent.start.getTime();
      const startedTime = dateTime.getTime();
      const nowTime = now.getTime();
      const endTime = calendarEvent.end.getTime();

      const diffStart = getMinutesBetweenTimes(calendarEvent.start, dateTime);
      let startText;
      if (startTime > startedTime) {
        startText = `<span class="green-text"><b id="start">-${ diffStart } min.</b></span>`;
      } else if (startTime < startedTime) {
        startText = `<span class="red-text"><b id="start">+${ diffStart } min.</b></span>`;
      } else {
        startText = '<span><b id="start">0 min.</b></span>';
      }

      const start = this.startedText.replace('{startText}', startText);

      const diffElapsed = getMinutesBetweenTimes(now, dateTime);
      const duration = getMinutesBetweenTimes(calendarEvent.end, calendarEvent.start);

      let elapsedText;
      if (duration > diffElapsed) {
        elapsedText = `<span class="green-text"><b id="elapsed">${ diffElapsed } min.</b></span>`;
      } else if (duration < diffElapsed) {
        elapsedText = `<span class="red-text"><b id="elapsed">+${ diffElapsed } min.</b></span>`;
      } else {
        elapsedText = '<span><b id="elapsed">0 min.</b></span>';
      }

      const timeElapsed = this.elapsedText.replace('{elapsedText}', elapsedText);

      const diffFinish = getMinutesBetweenTimes(calendarEvent.end, now);
      let finishText;
      if (endTime > nowTime) {
        finishText = `<span class="green-text"><b id="finish">-${ diffFinish } min.</b></span>`;
      } else if (endTime < nowTime) {
        finishText = `<span class="red-text"><b id="finish">+${ diffFinish } min.</b></span>`;
      } else {
        finishText = '<span><b id="finish">0 min.</b></span>';
      }

      const timeFinish = this.finishInText.replace('{finishText}', finishText);

      calendarEvent.title = `${ title } <div class="timing"> ${ start } ${ timeElapsed } ${ timeFinish }</div>`;
    }

    const isNow = isToday(calendarEvent.start);
    const showStart = isNow && [States.approved, States.partiallyPaid, States.paid].indexOf(calendarEvent.meta.state) >= 0;
    const showComplete = isNow && [States.started].indexOf(calendarEvent.meta.state) >= 0;
    const showApprove = [States.created].indexOf(calendarEvent.meta.state) >= 0;

    if (!calendarEvent.actions) {
      calendarEvent.actions = [{
        label: `<div class="mat-raised-button"><div class="material-icons">visibility</div>&nbsp;${ this.viewText }</div>`,
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.eventClick(event, 'VIEW');
        }
      }, {
        label: `<div class="mat-raised-button"><div class="material-icons">read_more</div>&nbsp;${ this.moreText }</div>`,
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.eventClick(event, 'MORE_INFO');
        }
      }];

      if (showApprove) {
        calendarEvent.actions = [{
          label: `<div class="mat-raised-button"><div class="material-icons">done</div>&nbsp;${ this.approveText }</div>`,
          onClick: ({ event }: { event: CalendarEvent }): void => {
            this.eventClick(event, 'APPROVE');
          }
        }, ...calendarEvent.actions];
      }

      if (showStart) {
        calendarEvent.actions = [{
          label: `<div class="mat-raised-button"><div class="material-icons">play_arrow</div>&nbsp;${ this.startText }</div>`,
          onClick: ({ event }: { event: CalendarEvent }): void => {
            this.eventClick(event, 'START');
          }
        }, ...calendarEvent.actions];
      }

      if (showComplete) {
        calendarEvent.actions = [{
          label: `<div class="mat-raised-button"><div class="material-icons">done_all</div>&nbsp;${ this.completeText }</div>`,
          onClick: ({ event }: { event: CalendarEvent }): void => {
            this.eventClick(event, 'COMPLETE');
          }
        }, ...calendarEvent.actions];
      }
    }

    return calendarEvent;
  }

  private updateEvent(id: string, dateStart?: Date, professionalId?: string): void {
    const reservation: IReservation = { id };
    if (dateStart) {
      const start = dateStart.toLocaleString(API_LOCALE);
      const timeZone = getCurrentTimeZone();
      reservation.start = start;
      reservation.timeZone = timeZone;
    }
    if (professionalId) {
      reservation.professionalId = professionalId;
    }
    this.store.dispatch(
      new fromActionsDashboard.UpdateEvent(reservation)
    );
  }

  private changeDate(date: Date): void {
    this.viewDate = createNewDate(date, this.viewDate.getHours(), this.viewDate.getMinutes());
    this.endDate = createNewDate(date, this.endDate.getHours(), this.endDate.getMinutes());
    this.startDate = createNewDate(date, this.startDate.getHours(), this.startDate.getMinutes());
    this.dateOrViewChanged();
  }

  private dateOrViewChanged(): void {
    this.prevBtnDisabled = !this.dateIsValid(
      endOfPeriod('day', subPeriod('day', this.viewDate, 1))
    );
    this.nextBtnDisabled = !this.dateIsValid(
      startOfPeriod('day', addPeriod('day', this.viewDate, 1))
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

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.dashboard = state.dashboard;
      this.createEvents(this.isDarkMode);
    });
  }

  private createEvents(darkMode: boolean = false): void {
    this.events = [];
    this.professionals = [];
    if (this.dashboard?.professionals) {
      const { min, max } = getRoomStartEndDay(this.dashboard.availability, this.dashboard.timeZone, this.viewDate);
      this.day = new Day(min, max, this.viewDate, []);
      this.endDate = createNewDate(this.endDate, this.day.dayEndHour, this.day.dayEndMinute);
      this.startDate = createNewDate(this.startDate, this.day.dayStartHour, this.day.dayStartMinute);
      this.dashboard.professionals.forEach((professionalEvent: IProfessionalEvent) => {
        const professional = new Professional(professionalEvent.id, professionalEvent.name,
          DashboardComponent.getProfessionalImage(professionalEvent), DashboardComponent.getColor(professionalEvent, darkMode));

        let reservations = 0;
        let seconds = 0;
        professionalEvent.calendarSummary.reservations?.forEach(it => {
          const color: EventColor = professional.color;
          const title: string = it.title;
          if (it.state !== States.completed) {
            reservations++;
            seconds += Math.abs(it.end - it.start);
          }
          const draggable = ![States.completed, States.started, States.cancelled].some(state => state === it.state);
          const start = newDateTimestamp(it.start);
          const end = it.end ? newDateTimestamp(it.end) : null;
          const started = it.started ? newDateTimestamp(it.started) : null;

          const event = {
            start, end, color, title, draggable, id: it.reservationId,
            meta: {
              professional,
              started,
              time: true,
              customerId: it.customerId,
              state: it.state,
              viewDate: this.viewDate
            },
            resizable: { beforeStart: true, afterEnd: true }
          } as CalendarEvent;

          this.events = [...this.events, this.createTitle(event)];
        });
        professional.reservations = reservations;
        professional.time = seconds;
        this.professionals = [...this.professionals, professional];

        let recurring: any[] = [];
        professionalEvent.calendarSummary.unavailable?.forEach(it => {
          const start = newDateTimestamp(it.start);
          const title = it.duration ? it.title : `${ this.translate.instant('COMMON.ALL_DAY.CHECK') } - ${ it.title }`;

          if (it.repeat === UnavailableRepeatType.none) {
            const end = getEnd(start, it.duration);
            const event = {
              start, end, title: it.title, id: it.unavailableId, color: professional.color, draggable: true,
              meta: { professional, time: true }, resizable: { beforeStart: true, afterEnd: true }
            } as CalendarEvent;

            this.events = [...this.events, event];
          } else {
            recurring = [...recurring, getFrequency(it.repeat, start, it.unavailableId, title, it.end, it.duration)];
          }
        });
        recurring.forEach(r =>
          r.rule.all().forEach((start: Date) => {
            const end = getEnd(start, r.duration);
            const event = {
              start, end,
              title: r.title,
              id: r.unavailableId,
              color: professional.color,
              draggable: true,
              meta: { professional, time: true },
              resizable: { beforeStart: true, afterEnd: true }
            } as CalendarEvent;
            this.events = [...this.events, event];
          })
        );
      });
    }
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsDashboard.Clean()
    );
  }

  private getEvents(): void {
    this.events = [];
    this.store.dispatch(
      new fromActionsDashboard.GetDashboardEvents(this.viewDate)
    );
  }

  private eventClick(event: CalendarEvent, type: string): void {
    const reservationId = event.id;
    switch (type) {
      case 'VIEW':
        this.router.navigate(['reservation', reservationId]);
        break;
      case 'APPROVE':
        this.events = this.events.filter(ev => ev.id !== event.id);
        this.store.dispatch(
          new fromActionsReservation.Approve(reservationId)
        );
        event.meta.state = States.approved;
        setTimeout(() => this.events = [...this.events, event], 1);
        break;
      case 'START':
        this.events = this.events.filter(ev => ev.id !== event.id);
        this.store.dispatch(
          new fromActionsReservation.Start(reservationId)
        );
        event.meta.state = States.started;
        event.meta.started = dateToTimestamp();
        event.draggable = false;
        event.actions = undefined;
        setTimeout(() => this.events = [...this.events, this.createTitle(event)], 1);
        break;
      case 'COMPLETE':
        this.router.navigate(['reservation', reservationId, 'rooms', this.dashboard?.roomId,
          'customer', event.meta.customerId, 'complete'], { state: { data: { isDashboard: true } } });
        break;
      case 'MORE_INFO':
        this.router.navigate(['reservation', reservationId, 'more-info']);
    }
  }
}
