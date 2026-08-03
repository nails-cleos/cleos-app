import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { CalendarDatePipe, CalendarEvent } from 'angular-calendar';
import {
  addPeriod,
  createNewDate,
  dateToTimestamp,
  DEFAULT_LOCALE,
  endOfPeriod,
  getCurrentTimeZone,
  getDurationOrUndefined,
  getEnd,
  getEndWithDuration,
  getMinutesBetweenTimesABS,
  getNowTimeZone,
  getRoomStartEndDay,
  isBetween,
  newDate,
  newDateTimestamp,
  startOfPeriod,
  subPeriod,
} from '../../util/dates';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ICalendarNote, ICalendarReservations, IProfessionalEvent } from '../dashboard';
import {
  DayViewSchedulerCalendarUtils,
  DayViewSchedulerComponent,
  IProfessional,
  Professional,
} from './day-view-scheduler.component';
import { EventColor } from 'calendar-utils';
import { Day, IReservation, MAX_RESERVATION_MONTH, States } from '../../reservation/reservation';
import { addMonths, isSameDay, isToday } from 'date-fns';
import { MatDialog } from '@angular/material/dialog';
import { createEventColor, getProfessionalColor } from '../../util/color';
import { CalendarDialogComponent } from '../../shared/dialog/calendar/calendar-dialog.component';
import { currencySymbol, executeDialogNoWidth, FrequencyEnum } from '../../util/helper';
import { AuthUserService } from '../../services/auth-user.service';
import { CounterComponent } from '../../util/counter/counter.component';
import { findStateColor } from '../../util/theme';
import { DataEvent, IDataEvent } from '../../util/event';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { DashboardStore } from '../../store/dashboard.store';
import { NavigationService } from '../../services/navigation.service';
import { ReservationStore } from '../../store/reservation.store';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard-event.component.html',
  styleUrls: ['./dashboard-event.component.scss'],
  imports: [DayViewSchedulerComponent, CounterComponent, CalendarDatePipe, MatIcon, MatButton,
    MatDatepickerInput, MatDatepicker, MatInput, TranslatePipe],
  providers: [DayViewSchedulerCalendarUtils],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardEventComponent {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly reservationStore = inject(ReservationStore);
  private readonly dashboardStore = inject(DashboardStore);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly authUserService: AuthUserService = inject(AuthUserService);

  picker = viewChild(MatDatepicker);

  private dashboardSignal = this.dashboardStore.dashboard;
  private authUserSignal = this.authUserService.authUser;

  private isDarkMode = computed(() => this.authUserSignal()?.isDarkMode ?? false);

  availability = computed(() => this.dashboardSignal()?.availability);

  viewDate = signal(getNowTimeZone());
  updateEventDate = signal(getNowTimeZone());

  displayDate = getNowTimeZone();
  today: Date = createNewDate(getNowTimeZone());
  maxDate: Date;
  day: Day = new Day();

  professionals: IProfessional[] = [];
  calendar: IDataEvent = new DataEvent([], 0, this.viewDate(), 0, false);

  readonly language = this.navigationService.language;

  prevBtnDisabled = false;
  nextBtnDisabled = false;

  private calendarReady = signal(false);

  constructor() {
    this.dashboardStore.clean();
    effect(() => {
      const date = history.state?.date;
      if (date) {
        this.viewDate.set(date);
      }
    });

    effect(() => {
      const date = this.viewDate();
      this.calendar.resetEvents();
      this.dashboardStore.getMyEvent(date);
    });

    effect(() => {
      const dashboard = this.dashboardSignal();
      const darkMode = this.isDarkMode();
      const calendarReady = this.calendarReady();
      const viewDate = this.updateEventDate();
      if (!calendarReady) {
        return;
      }

      this.calendar.resetEvents();
      this.professionals = [];
      if (dashboard?.professionals) {
        const { min, max } = getRoomStartEndDay(dashboard.availability, dashboard.timeZone, viewDate);
        this.day = new Day(min, max, viewDate, []);
        dashboard.professionals.forEach((professionalEvent: IProfessionalEvent) => {
          const professional = new Professional(professionalEvent.id, professionalEvent.name,
            DashboardEventComponent.getProfessionalImage(professionalEvent),
            DashboardEventComponent.getColor(professionalEvent, darkMode));

          let reservations = 0;
          let seconds = 0;
          professionalEvent.calendarSummary.reservations?.forEach(it => {
            const color: EventColor = professional.color;
            const title: string = it.title;
            if (it.state !== States.completed) {
              reservations++;
              seconds += Math.abs(it.end - it.start);
            }
            const draggable = ![States.completed, States.started, States.cancelled]
              .some(state => state === it.state);
            const start = newDateTimestamp(it.start);
            const end = it.end ? newDateTimestamp(it.end) : null;
            const started = it.started ? newDateTimestamp(it.started) : null;
            const finished = it.finished ? newDateTimestamp(it.finished) : null;

            const event = {
              start, end, color, title, draggable, id: it.reservationId,
              meta: {
                professional,
                started,
                time: true,
                timeZone: dashboard.timeZone,
                customerId: it.customerId,
                professionalName: professional.name,
                currency: dashboard.currencyCode,
                finished,
                durationSeconds: DashboardEventComponent.reservationDurationSeconds(it),
                state: it.state,
                total: it.total,
                viewDate,
              },
              resizable: { beforeStart: true, afterEnd: true },
            } as CalendarEvent;

            this.calendar.addEvent(this.createTitle(event));
          });
          professional.reservations = reservations;
          professional.time = seconds;
          this.professionals = [...this.professionals, professional];

          professionalEvent.calendarSummary.unavailable?.forEach(it => {
            const start = newDateTimestamp(it.start);
            const title = it.duration ?
              it.title : `${ this.translateService.instant('COMMON.ALL_DAY.CHECK') } - ${ it.title }`;

            let path = 'unavailable/';
            if (it.type === 'BLOCK_AGENDA') {
              path += 'block-agenda/';
            }
            const state = 'UNAVAILABLE';
            const color = findStateColor(state, darkMode);
            if (it.repeat === FrequencyEnum.none) {
              const end = getEnd(start, it.duration);
              const event = {
                start,
                end,
                title,
                id: it.unavailableId,
                color: createEventColor(color, darkMode),
                draggable: true,
                meta: { professional, time: true, state },
                resizable: { beforeStart: true, afterEnd: true },
              } as CalendarEvent;

              this.calendar.addEvent(event);
            } else {
              this.calendar.recurringEvent?.addFrequency(it.repeat, start, it.unavailableId, title, 'UNAVAILABLE',
                path, (date, recurring) => this.createUnavailableEvent(date, recurring, professional, darkMode),
                getDurationOrUndefined(it.duration));
            }
          });

          professionalEvent.calendarSummary.birthdays?.forEach(it =>
            this.calendar.addEvent(this.createDashboardAllDayEvent(
              it.title, it.userId, 'BIRTHDAY', professional, darkMode,
              this.normalizeYearDate(newDateTimestamp(it.date), viewDate))));

          professionalEvent.calendarSummary.transactions?.forEach(it =>
            this.calendar.addEvent(this.createDashboardAllDayEvent(
              it.title, it.transactionId, 'TRANSACTION', professional, darkMode, newDateTimestamp(it.createdAt),
              it.total)));

          professionalEvent.calendarSummary.notes?.forEach(it => this.addNoteEvent(it, professional, darkMode));
        });
        this.calendar.recurringEvent?.execute();
      }
    });

    this.day = new Day();
    this.maxDate = addMonths(getNowTimeZone(), MAX_RESERVATION_MONTH);
    this.dateOrViewChanged();
  }

  private static getProfessionalImage = (professional: IProfessionalEvent): string => {
    let image;
    if (professional.imageUrl) {
      if (professional.imageUrl.indexOf('http') >= 0) {
        image = professional.imageUrl;
      }
    } else if (professional.image) {
      image = `data:image/jpg;base64,${ professional.image }`;
    }

    return image || 'assets/icons/icon-512x512.png';
  };

  private static getColor = (
    professional: IProfessionalEvent,
    isDark: boolean,
  ): EventColor => getProfessionalColor(isDark, professional.darkColor, professional.lightColor);

  private static reservationDurationSeconds = (reservation: ICalendarReservations): number | undefined => {
    const started = reservation.started ? newDateTimestamp(reservation.started) : null;
    const completed = reservation.finished ? newDateTimestamp(reservation.finished) : null;
    if (started && completed) {
      return Math.abs((completed.getTime() - started.getTime()) / 1000);
    }

    return undefined;
  };

  private addNoteEvent = (note: ICalendarNote, professional: Professional, darkMode: boolean): void => {
    const start = newDateTimestamp(note.date);
    if (note.repeat === FrequencyEnum.none) {
      this.calendar.addEvent(this.createDashboardAllDayEvent(note.title, note.noteId, 'NOTE', professional, darkMode,
        start));
      return;
    }

    let repeatDate: Date;
    if (this.calendar.calendarStart && this.calendar.calendarStart >= start) {
      repeatDate = new Date(this.calendar.calendarStart);
      repeatDate.setDate(start.getDate());
    } else {
      repeatDate = start;
    }

    this.calendar.recurringEvent?.addFrequency(note.repeat, repeatDate, note.noteId, note.title, 'NOTE',
      'notes/', (date, recurring) => {
        this.calendar.addEvent(this.createDashboardAllDayEvent(recurring.title, recurring.id, recurring.state,
          professional, darkMode, date));
      }, undefined, undefined, true);
  };

  private createDashboardAllDayEvent = (
    title: string,
    id: string,
    state: string,
    professional: Professional,
    darkMode: boolean,
    start: Date,
    total?: number,
  ): CalendarEvent => ({
    id,
    start,
    title,
    allDay: true,
    color: createEventColor(findStateColor(state, darkMode), darkMode),
    meta: { professional, time: false, state, total },
  } as CalendarEvent);

  increment() {
    this.picker()?.select(addPeriod('day', this.viewDate(), 1));
  }

  decrement() {
    this.picker()?.select(subPeriod('day', this.viewDate(), 1));
  }

  beforeMonthViewRender = ({ period }: any): void => {
    this.calendar.calendarStart = period.start;
    this.calendar.calendarEnd = period.end;
    this.calendar.createRecurring();
    this.calendarReady.set(true);
  };

  selectDate = (event: any): void => {
    this.changeDate(newDate(event.value));
  };

  eventTimesChanged = ({ event, newStart, newEnd }: any): void => {
    event.start = newStart;
    event.end = newEnd;
    this.calendar.refresh();
    this.updateEvent(event.id, event.start);
  };

  professionalChanged = ({ event, newProfessional }: any): void => {
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
    this.calendar.refresh();
    setTimeout(() => this.updateEvent(event.id, undefined, newProfessional.id), 500);
  };

  refreshViewDate = (now: Date): void => {
    if (isSameDay(now, this.viewDate())) {
      if (now.getSeconds() === 0) {
        const newEvents = this.calendar.calendarEvents.map((event: CalendarEvent) => this.createTitle(event));
        this.calendar.resetEvents();
        this.calendar.addEvents(newEvents);
        this.updateEventDate.set(now);
      }
      this.displayDate = now;
    }
  };

  segmentClick = (date: Date, professionalId: string): void => {
    if (date && professionalId && this.dateIsValid(date)) {
      const data = { date, professionalId, isDashboard: true };
      executeDialogNoWidth(this.dialog, CalendarDialogComponent, null, result => {
        if (result) {
          this.navigationService.navigate(result.split(','), { state: data });
        }
      });
    }
  };

  private createTitle = (calendarEvent: CalendarEvent, now: Date = getNowTimeZone()): CalendarEvent => {
    if (!this.isReservationState(calendarEvent.meta?.state)) {
      return calendarEvent;
    }

    const originalTitle = calendarEvent.meta?.originalTitle ?? calendarEvent.title ?? '';
    const matcher = originalTitle.match(/(?<=<b>\s*).*?(?=\s*<\/b>)/gs);
    const title = matcher ? `<b>${ matcher[0] }</b>` : originalTitle;

    if (calendarEvent.meta.state === States.completed) {
      calendarEvent.title = this.createCompletedReservationTitle(calendarEvent);
    } else {
      calendarEvent.title = this.createReservationTitle(calendarEvent, title);
    }

    if (calendarEvent.meta.state === States.started && calendarEvent.end) {
      const dateTime = calendarEvent.meta.started instanceof Date ? calendarEvent.meta.started
        : newDateTimestamp(calendarEvent.meta.started);
      const startTime = calendarEvent.start.getTime();
      const startedTime = dateTime.getTime();
      const nowTime = now.getTime();
      const endTime = calendarEvent.end.getTime();

      const diffStart = getMinutesBetweenTimesABS(calendarEvent.start, dateTime);
      let startText;
      if (startTime > startedTime) {
        startText = `<span class="green-text-contrast"><b id="start">-${ this.formatMinutes(diffStart) }</b></span>`;
      } else if (startTime < startedTime) {
        startText = `<span class="red-text"><b id="start">+${ this.formatMinutes(diffStart) }</b></span>`;
      } else {
        startText = `<b id="start">${ this.formatMinutes(0) }</b>`;
      }

      const start = this.roomTranslation('STARTED', '<div>Started {startText}</div>')
        .replace('{startText}', startText);

      const diffElapsed = getMinutesBetweenTimesABS(now, dateTime);
      const duration = getMinutesBetweenTimesABS(calendarEvent.end, calendarEvent.start);

      const elapsedText = `<b id="elapsed">${ this.formatMinutes(diffElapsed) }</b>`;

      const timeElapsed = this.roomTranslation('ELAPSED', '<div>Elapsed {elapsedText}</div>')
        .replace('{elapsedText}', elapsedText);

      const projectedEnd = new Date(startedTime + (duration * 60 * 1000));
      const projectedFinish = this.roomTranslation('EXPECTED_FINISH', '<div>Expected finish {finishTime}</div>')
        .replace('{finishTime}', `<b id="projected-finish">${ this.formatTime(projectedEnd) }</b>`);

      const diffFinish = getMinutesBetweenTimesABS(calendarEvent.end, now);
      let timeFinish = '';
      if (endTime > nowTime) {
        const finishText = `<span class="green-text-contrast"><b id="finish">-${ this.formatMinutes(
          diffFinish) }</b></span>`;
        timeFinish = this.roomTranslation('FINISH_IN', '<div>Finish in {finishText}</div>')
          .replace('{finishText}', finishText);
      }

      calendarEvent.title =
        `${ calendarEvent.title } <div class="timing"> ${ start } ${ timeElapsed } ${ timeFinish } ${ projectedFinish }</div>`;
    }

    const isNow = isToday(calendarEvent.start);
    const showStart = isNow && [States.approved, States.partiallyPaid, States.paid].indexOf(calendarEvent.meta.state) >=
      0;
    const showComplete = isNow && [States.started].indexOf(calendarEvent.meta.state) >= 0;
    const showApprove = [States.created].indexOf(calendarEvent.meta.state) >= 0;

    if (!calendarEvent.actions) {
      calendarEvent.actions = [{
        label: this.createLabel('visibility', this.roomTranslation('VIEW', 'View')),
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.eventClick(event, 'VIEW');
        },
      }, {
        label: this.createLabel('read_more', this.roomTranslation('MORE_INFO', 'More')),
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.eventClick(event, 'MORE_INFO');
        },
      }];

      if (showApprove) {
        calendarEvent.actions = [{
          label: this.createLabel('check_circle', this.roomTranslation('APPROVE', 'Approve')),
          onClick: ({ event }: { event: CalendarEvent }): void => {
            this.eventClick(event, 'APPROVE');
          },
        }, ...calendarEvent.actions];
      }

      if (showStart) {
        calendarEvent.actions = [{
          label: this.createLabel('play_arrow', this.roomTranslation('START', 'Start')),
          onClick: ({ event }: { event: CalendarEvent }): void => {
            this.eventClick(event, 'START');
          },
        }, ...calendarEvent.actions];
      }

      if (showComplete) {
        calendarEvent.actions = [{
          label: this.createLabel('done_all', this.roomTranslation('COMPLETE', 'Complete')),
          onClick: ({ event }: { event: CalendarEvent }): void => {
            this.eventClick(event, 'COMPLETE');
          },
        }, ...calendarEvent.actions];
      }
    }

    return calendarEvent;
  };

  private isReservationState = (state?: string): boolean =>
    Object.values(States).includes(state as States);

  private normalizeYearDate = (date: Date, viewDate: Date): Date => {
    const normalized = new Date(date);
    normalized.setFullYear(viewDate.getFullYear());
    return normalized;
  };

  private createReservationTitle = (calendarEvent: CalendarEvent, title: string): string => {
    const customer = calendarEvent.meta?.customer;
    const meta = calendarEvent.meta ?? {};
    const total = typeof meta.total === 'number' ? meta.total : undefined;
    const time = calendarEvent.end
      ? `${ this.formatTime(calendarEvent.start) } - ${ this.formatTime(calendarEvent.end) }`
      : this.formatTime(calendarEvent.start);

    return `<div class="dashboard-reservation-card">
      <div class="dashboard-reservation-card__header">
        <strong>${ this.escapeHtml(customer || this.stripHtml(title)) }</strong>
        ${ this.createStatusBadge(calendarEvent.meta?.state) }
      </div>
      ${ customer ? `<div class="dashboard-reservation-card__body">${ title }</div>` : '' }
      <div class="dashboard-reservation-card__badges">
        ${ this.createInfoBadge('schedule', time) }
        ${ total !== undefined ? this.createInfoBadge('payments', this.formatAmount(total, meta.currency)) : '' }
      </div>
    </div>`;
  };

  private createCompletedReservationTitle = (calendarEvent: CalendarEvent): string => {
    const meta = calendarEvent.meta ?? {};
    const time = this.completedTime(calendarEvent);
    const total = typeof meta.total === 'number' ? meta.total : undefined;
    const fallbackTitle = calendarEvent.title;
    const duration = typeof meta.durationSeconds === 'number' ? this.formatDuration(meta.durationSeconds) : undefined;
    const detail = `<div class="completed-reservation-card__details completed-reservation-card__details--html">
      ${ this.createInfoBadge('schedule', time) }
      ${ total !== undefined ? this.createInfoBadge('payments', this.formatAmount(total, meta.currency)) : '' }
      ${ duration ? this.createInfoBadge('timer', duration) : '' }
    </div>`;

    return `<div class="completed-reservation-card">
      <div class="completed-reservation-card__header">
        <strong>${ this.escapeHtml(meta.customer || this.stripHtml(fallbackTitle)) }</strong>
        ${ this.createStatusBadge(meta.state) }
      </div>
      ${ detail }
    </div>`;
  };

  private formatTime = (date: Date): string => `${ String(date.getHours()).padStart(2, '0') }:${ String(
    date.getMinutes()).padStart(2, '0') }`;

  private formatMinutes = (minutes: number): string => {
    if (minutes < 60) {
      return `${ minutes } min.`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes ? `${ hours }h ${ remainingMinutes } min.` : `${ hours }h`;
  };

  private completedTime = (calendarEvent: CalendarEvent): string => {
    const meta = calendarEvent.meta ?? {};
    if (meta.started && meta.finished) {
      return `${ this.formatTime(meta.started) } - ${ this.formatTime(meta.finished) }`;
    }

    return calendarEvent.end
      ? `${ this.formatTime(calendarEvent.start) } - ${ this.formatTime(calendarEvent.end) }`
      : this.formatTime(calendarEvent.start);
  };

  private formatAmount = (amount: number, currency?: any): string => `${ currencySymbol(
    currency) } ${ new Intl.NumberFormat(this.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) }`;

  private formatDuration = (seconds: number): string => {
    const totalMinutes = Math.round(seconds / 60);

    return `${ this.formatMinutes(totalMinutes) }`;
  };

  private createStatusBadge = (state?: string): string => {
    const label = this.statusLabel(state);
    return `<span class="dashboard-reservation-status">${ this.escapeHtml(label) }</span>`;
  };

  private createInfoBadge = (icon: string, text: string): string =>
    `<span class="dashboard-reservation-badge">
      <span class="custom-material-icons material-icons">${ icon }</span>
      <span>${ this.escapeHtml(text) }</span>
    </span>`;

  private statusLabel = (state?: string): string => {
    if (!state) {
      return '';
    }
    return this.translation(`COMMON.STATUS.RESERVATION.${ state }`, state);
  };

  private translation = (key: string, fallback: string): string => {
    const value = this.translateService.instant(key);

    return value && value !== key ? this.stripHtml(value) : fallback;
  };

  private stripHtml = (value: string): string => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  private escapeHtml = (value: string): string => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  private roomTranslation(key: string, fallback: string): string {
    const translationKey = `DASHBOARD.ROOM.${ key }`;
    const value = this.translateService.instant(translationKey);

    return value && value !== translationKey ? value : fallback;
  }

  private updateEvent = (id: string, dateStart?: Date, professionalId?: string): void => {
    const reservation: IReservation = { id };
    if (dateStart) {
      const start = dateStart.toLocaleString(DEFAULT_LOCALE);
      const timeZone = getCurrentTimeZone();
      reservation.start = start;
      reservation.timeZone = timeZone;
    }
    if (professionalId) {
      reservation.professionalId = professionalId;
    }
    this.dashboardStore.updateEvent(id, reservation);
  };

  private changeDate = (date: Date): void => {
    const viewDate = this.viewDate();
    this.viewDate.set(createNewDate(date, viewDate.getHours(), viewDate.getMinutes()));
    this.dateOrViewChanged();
  };

  private dateOrViewChanged = (): void => {
    const viewDate = this.viewDate();
    this.prevBtnDisabled = !this.dateIsValid(endOfPeriod('day', subPeriod('day', viewDate, 1)));
    this.nextBtnDisabled = !this.dateIsValid(startOfPeriod('day', addPeriod('day', viewDate, 1)));
    if (viewDate < this.today) {
      this.changeDate(this.today);
    } else if (viewDate > this.maxDate) {
      this.changeDate(this.maxDate);
    }
  };

  private dateIsValid = (date: Date): boolean => isBetween(this.today, this.maxDate, date);

  private createLabel = (icon: string, text: string) => `<div class="contrast-text mat-raised-button">
                   <div class="custom-material-icons material-icons">${ icon }</div>&nbsp;${ text }
               </div>`;

  private createUnavailableEvent = (start: Date, recurring: any, professional: Professional, darkMode: boolean) => {
    const end = getEndWithDuration(start, recurring.duration);
    const color = findStateColor(recurring.state, darkMode);
    const event = {
      start,
      end,
      title: recurring.title,
      id: recurring.id,
      color: createEventColor(color, darkMode),
      draggable: true,
      meta: { professional, time: true, state: recurring.state },
      resizable: { beforeStart: true, afterEnd: true },
    } as CalendarEvent;
    this.calendar.addEvent(event);
  };

  private eventClick = (event: CalendarEvent, type: 'VIEW' | 'START' | 'APPROVE' | 'COMPLETE' | 'MORE_INFO'): void => {
    const reservationId = `${ event.id! }`;
    switch (type) {
      case 'VIEW':
        this.navigationService.navigate(['reservation', reservationId]);
        break;
      case 'APPROVE':
        this.calendar.filterEvent(event);
        this.reservationStore.approve(reservationId, undefined, true);
        event.meta.state = States.approved;
        setTimeout(() => this.calendar.addEvent(event), 1);
        break;
      case 'START':
        this.calendar.filterEvent(event);
        this.reservationStore.start(reservationId, undefined, true, event.meta.viewDate ?? this.viewDate());
        event.meta.state = States.started;
        event.meta.started = dateToTimestamp();
        event.draggable = false;
        event.actions = undefined;
        setTimeout(() => this.calendar.addEvent(this.createTitle(event)), 1);
        break;
      case 'COMPLETE':
        this.navigationService.navigate(
          ['reservation', reservationId, 'rooms', this.dashboardSignal()?.roomId,
            'customer', event.meta.customerId, 'complete'], { state: { isDashboard: true } });
        break;
      case 'MORE_INFO':
        this.navigationService.navigate(['reservation', reservationId, 'more-info']);
    }
  };
}
