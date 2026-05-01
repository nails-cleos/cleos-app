import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { getCards, getEvents } from '../store/dashboard.actions';
import { IReservationSummary, States } from '../interfaces/reservation';
import { TranslateService } from '@ngx-translate/core';
import {
  getDurationOrUndefined,
  getEnd,
  getEndWithDuration,
  getNowTimeZone,
  greaterOrEqualsThan,
  newDateTimestamp,
} from '../util/dates';
import {
  CalendarDatePipe,
  CalendarEvent,
  CalendarMonthViewComponent,
  CalendarMonthViewDay,
  CalendarNextViewDirective,
  CalendarPreviousViewDirective,
  CalendarTodayDirective,
  CalendarView,
  ClickDirective,
} from 'angular-calendar';
import { findStateColor, getStateOrder } from '../util/theme';
import { allDayEvent, DataEvent, IDataEvent, IMeta, Meta, monthEvent } from '../util/event';
import { Router } from '@angular/router';
import { isSameDay, isSameMonth, startOfMonth } from 'date-fns';
import { ICalendarNote, ICalendarSummary, IChart } from '../interfaces/dashboard';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { IRoom } from '../interfaces/room';
import { CalendarDialogComponent } from '../shared/dialog/calendar/calendar-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { executeDialogNoWidth, FrequencyEnum } from '../util/helper';
import { numberFormat } from '../util/numbers';
import { ICurrency } from '../interfaces/currency';
import { AuthUserService } from '../services/auth-user.service';
import { SharedModule } from '../shared/shared.module';
import { MiniCardComponent } from './mini-card/mini-card.component';
import { ReservationTableComponent } from './reservation/table/reservation-table.component';
import { CardComponent } from '../shared/card/card.component';
import { ChartComponent } from '../shared/chart/chart.component';
import { IError } from '../interfaces/common';
import {
  getDashboardMapPipe,
  getDashboardNavigationParamsPipe,
  getErrorPipe,
  isDashboardLoadingPipe,
} from '../store/selectors/dashboard.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { DashboardState } from '../store/reducers/dashboard.reducers';

type DashboardForm = {
  selectedDash: FormControl<string | undefined>;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [SharedModule, MiniCardComponent, ReservationTableComponent, CardComponent, ChartComponent, CalendarDatePipe,
    CalendarNextViewDirective, CalendarTodayDirective, CalendarPreviousViewDirective, CalendarMonthViewComponent,
    ClickDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<DashboardState> = inject(Store<DashboardState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly router: Router = inject(Router);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  form: FormGroup<DashboardForm> = this.formBuilder.group<DashboardForm>({
    selectedDash: this.formBuilder.control(undefined),
  });

  private navigationParams$ = this.store.pipe(getDashboardNavigationParamsPipe);
  private dashboardMap$ = this.store.pipe(getDashboardMapPipe);
  private error$ = this.store.pipe(getErrorPipe);
  private isLoading$ = this.store.pipe(isDashboardLoadingPipe);
  private breakpointObserver$ = this.breakpointObserver.observe(
    [Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium]);

  private navigationParams = toSignal(this.navigationParams$);
  private authUserSignal = this.authUserService.authUser;
  private breakpointsSignal = toSignal(
    this.breakpointObserver$, {
      initialValue: {
        matches: false,
        breakpoints: {
          [Breakpoints.XSmall]: false,
          [Breakpoints.Small]: false,
          [Breakpoints.Medium]: false,
        },
      },
    },
  );

  private isDarkMode = computed(() => this.authUserSignal().isDarkMode);
  private isLoadingSignal = toSignal(this.isLoading$);
  private selectDashboardSignal = toSignal(this.getForm.selectedDash.valueChanges);
  private dashboardSelection = computed(() => {
    const selected = this.selectDashboardSignal();
    const dashboardData = this.dashboardMapSignal();
    const isDarkMode = this.isDarkMode();
    return { selected, dashboardData, isDarkMode };
  });

  dashboardMapSignal = toSignal(this.dashboardMap$);
  errorSignal = toSignal(this.error$);
  cardLayoutSignal = computed(() => {
    const breakpointState = this.breakpointsSignal();
    const authUser = this.authUserSignal();
    const miniCard = authUser?.isAdmin || authUser?.isManager ? { cols: 1, rows: 1 } : { cols: 0, rows: 0 };

    if (breakpointState.breakpoints[Breakpoints.Medium]) {
      return {
        columns: 2,
        rowHeight: '250px',
        miniCard,
        calendar: { cols: 2, rows: 4 },
        chart: { cols: 2, rows: 2 },
        table: { cols: 2, rows: 3 },
      };
    }

    if (breakpointState.matches) {
      return {
        columns: 1,
        rowHeight: '250px',
        miniCard,
        calendar: { cols: 1, rows: 4 },
        chart: { cols: 1, rows: 1.5 },
        table: { cols: 1, rows: 3 },
      };
    }

    return {
      columns: 4,
      rowHeight: '250px',
      miniCard,
      calendar: { cols: 4, rows: 4 },
      chart: { cols: 2, rows: 2 },
      table: { cols: 4, rows: 3 },
    };
  });

  calendarSummary?: ICalendarSummary;
  error?: IError;
  roomId?: string;
  professionalId?: string;

  timeZone?: string;
  view: CalendarView = CalendarView.Month;
  viewDate = signal(getNowTimeZone(this.timeZone));
  readonly viewMonth = computed(() => {
    const date = this.viewDate();
    return `${date.getFullYear()}-${date.getMonth()}`;
  });
  readonly isLoading = computed(() => this.isLoadingSignal() ?? true);

  activeDayIsOpen = false;
  dateFormat: string = this.translate.getCurrentLang();
  calendar: IDataEvent = new DataEvent([], 0, this.viewDate()!, 0, false);

  currency?: ICurrency;
  all = false;
  thisMonthTotal: string = numberFormat(0, this.currency, this.dateFormat);

  miniCardData: IReservationSummary[] = [{} as IReservationSummary, {} as IReservationSummary,
    {} as IReservationSummary, {} as IReservationSummary];

  charts: IChart[] = [{} as IChart, {} as IChart, {} as IChart,
    {} as IChart, {} as IChart, {} as IChart, {} as IChart, {} as IChart];

  private readonly language: string = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      const params = this.navigationParams();
      if (params?.date) {
        this.viewDate.set(params.date);
      }
      this.activeDayIsOpen = params?.activeDayIsOpen ?? false;
    });

    effect(() => {
      const { selected, dashboardData, isDarkMode } = this.dashboardSelection();

      if (!dashboardData) {
        return;
      }
      let roomSelected: string;
      if (!selected) {
        const primaryKey = Object.entries(dashboardData).find(([, val]) => val?.primary)?.[0];
        if (primaryKey) {
          this.getForm.selectedDash.setValue(primaryKey, { emitEvent: false });
          roomSelected = primaryKey;
        } else {
          return;
        }
      } else {
        roomSelected = selected;
      }
      const dashboard = dashboardData[roomSelected];
      if (dashboard) {
        this.error = dashboard.error;
        this.roomId = dashboard.roomId;
        this.professionalId = dashboard.professionalId;
        this.currency = dashboard.currency;
        this.calendarSummary = dashboard.calendarSummary;
        this.all = dashboard.all ?? false;
        this.timeZone = dashboard.timeZone;
        this.thisMonthTotal = numberFormat(dashboard.thisMonthTotal || 0, this.currency, this.dateFormat);
        this.createEvents(isDarkMode);
        if (!dashboard.chartSummaries && !dashboard.miniCardSummaries) {
          this.charts = [{} as IChart, {} as IChart, {} as IChart,
            {} as IChart, {} as IChart, {} as IChart, {} as IChart, {} as IChart];
          this.miniCardError('NO_CONTENT');
        } else {
          if (dashboard.chartSummaries && dashboard.chartSummaries.length) {
            this.charts = dashboard.chartSummaries;
          } else {
            this.charts = [{} as IChart, {} as IChart, {} as IChart,
              {} as IChart, {} as IChart, {} as IChart, {} as IChart, {} as IChart];
          }
          if (dashboard.miniCardSummaries && dashboard.miniCardSummaries.length) {
            this.miniCardData = dashboard.miniCardSummaries.map(miniCard => {
              if (!miniCard.isCurrency) {
                return miniCard;
              }
              return {
                ...miniCard,
                value: miniCard.value
                  ? numberFormat(miniCard.value, this.currency, this.dateFormat)
                  : miniCard.value,
                previousPeriodValue: miniCard.previousPeriodValue
                  ? numberFormat(miniCard.previousPeriodValue, this.currency, this.dateFormat)
                  : miniCard.previousPeriodValue,
              };
            });
          } else {
            this.miniCardError('NO_CONTENT');
          }
        }
      }
    });

    effect(() => {
      const error = this.errorSignal();
      if (error?.message) {
        this.miniCardError(error.message);
      }
    });

    effect(() => {
      this.viewMonth();
      const date = untracked(() => this.viewDate());

      this.calendar.resetEvents();
      this.store.dispatch(getEvents({ date }));
      this.store.dispatch(getCards({ date }));
    });
  }

  get getForm(): DashboardForm {
    return this.form.controls;
  }

  get completed(): number {
    return this.calendar.calendarEvents?.filter(
      (event: CalendarEvent) => DashboardComponent.completedByMonth(event, this.viewDate())).length ?? 0;
  }

  get completedTotal(): string {
    const total = this.calendar.calendarEvents?.filter(
      (event: CalendarEvent) => DashboardComponent.completedByMonth(event, this.viewDate()))
      .reduce((a, b) => a + b.meta.total || 0, 0);

    return numberFormat(total, this.currency, this.dateFormat);
  }

  get upcoming(): number {
    return this.calendar.calendarEvents?.filter(
      (event: CalendarEvent) => DashboardComponent.upcomingByMonth(event, this.viewDate())).length;
  }

  get upcomingTotal(): string {
    const total = this.calendar.calendarEvents?.filter(
      (event: CalendarEvent) => DashboardComponent.upcomingByMonth(event, this.viewDate()))
      .reduce((a, b) => a + b.meta.total || 0, 0);

    return numberFormat(total, this.currency, this.dateFormat);
  }

  get transaction(): number {
    return this.calendar.calendarEvents?.filter(
      (event: CalendarEvent) => DashboardComponent.transactionByMonth(event, this.viewDate())).length;
  }

  get transactionTotal(): string {
    const total = this.calendar.calendarEvents?.filter(
      (event: CalendarEvent) => DashboardComponent.transactionByMonth(event, this.viewDate()))
      .reduce((a, b) => a + b.meta.total || 0, 0);

    return numberFormat(total, this.currency, this.dateFormat);
  }

  private static createErrorMiniCard = (title: string, message: string): IReservationSummary => ({
    title: `DASHBOARD.MINI_CARD.${title}`,
    error: {
      status: message,
    },
  });

  private static completedByMonth = (
    event: CalendarEvent,
    viewDate: Date,
  ): boolean => event.meta.state === States.completed && isSameMonth(event.start, viewDate);

  private static upcomingByMonth = (
    event: CalendarEvent,
    viewDate: Date,
  ): boolean => isSameMonth(event.start, viewDate) && event.meta.state
    && [States.created, States.approved, States.partiallyPaid, States.paid].includes(event.meta.state);

  private static transactionByMonth = (
    event: CalendarEvent,
    viewDate: Date,
  ): boolean => event.meta.state === 'TRANSACTION' && isSameMonth(event.start, viewDate);

  closeOpenMonthViewDay(date: Date): void {
    this.activeDayIsOpen = false;
    const now = getNowTimeZone();
    if (isSameMonth(date, now)) {
      this.viewDate.set(date);
    } else {
      this.viewDate.set(startOfMonth(date));
    }
  }

  handleEvent = (event: CalendarEvent): void => {
    this.router.navigate(event.meta.route);
  };

  dayClicked = ({ date, events }: { date: Date; events: CalendarEvent[] }): void => {
    if (isSameMonth(date, this.viewDate())) {
      this.activeDayIsOpen = !((isSameDay(this.viewDate(), date) && this.activeDayIsOpen) || events.length === 0);
      this.viewDate.set(date);
    }
    if (events.length === 0) {
      const room = { id: this.roomId };
      this.segmentClick(date, room);
    }
  };

  cellClick = (date: any): void => {
    const room = { id: this.roomId };
    this.segmentClick(date, room);
  };

  beforeMonthViewRender = ({ body, period }: { body: CalendarMonthViewDay<IMeta>[]; period: any }): void => {
    this.calendar.calendarStart = period.start;
    this.calendar.calendarEnd = period.end;
    this.calendar.createRecurring();
    body.forEach((cell) => {
      const groups: Record<string, CalendarEvent<IMeta>[]> = {};
      cell.events.forEach((event: CalendarEvent<IMeta>) => {
        if (!event.meta?.state) {
          return;
        }
        groups[event.meta.state] = groups[event.meta.state] || [];
        groups[event.meta.state].push(event);
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      cell.eventGroups = Object.entries(groups);
    });
  };

  sortBy = (eventGroups: CalendarEvent<IMeta>[]): any => eventGroups.sort(
    (a: any, b: any) => getStateOrder(a[0]) - getStateOrder(b[0]));

  private segmentClick = (date: Date, room?: IRoom): void => {
    if (date && room) {
      const data = { date, roomId: room.id };
      executeDialogNoWidth(this.dialog, CalendarDialogComponent, null, result => {
        if (result) {
          this.router.navigate([this.language].concat(result.split(',')), { state: data });
        }
      });
    }
  };

  private miniCardError = (error: string): void => {
    const revenue = DashboardComponent.createErrorMiniCard('TOTAL_TREATMENT_SALES', error);

    const treatments = DashboardComponent.createErrorMiniCard('AVERAGE_TREATMENT_VALUE', error);

    const totalTreatments = DashboardComponent.createErrorMiniCard('TOTAL_TREATMENTS', error);

    const customer = DashboardComponent.createErrorMiniCard('NEW_CUSTOMERS_RESERVATION', error);
    this.miniCardData = [revenue, treatments, totalTreatments, customer];
  };

  private createEvents = (darkMode: boolean = false): void => {
    this.calendar.resetEvents();
    const calendarSummary = this.calendarSummary;
    if (calendarSummary) {
      const reservationEvents = calendarSummary.reservations?.map(it => {
        const start = newDateTimestamp(it.start);
        const end = it.end ? newDateTimestamp(it.end) : null;
        this.activeDayIsOpen = this.activeDayIsOpen
          ? this.activeDayIsOpen : isSameDay(start, getNowTimeZone(this.timeZone));

        const meta = new Meta(true, this.timeZone, it.state, [this.language, 'reservation', it.reservationId],
          undefined, it.total);
        meta.isReservation = true;
        return monthEvent(it.title, start, end, it.reservationId, findStateColor(it.state, darkMode), meta, darkMode);
      });
      const unavailableEvents = calendarSummary.unavailable?.map(it => {
        if (it.type === 'BLOCK_AGENDA') {
          return undefined;
        }
        const start = newDateTimestamp(it.start);
        this.activeDayIsOpen = this.activeDayIsOpen
          ? this.activeDayIsOpen : isSameDay(start, getNowTimeZone(this.timeZone));
        const title = it.duration ? it.title : `${this.translate.instant('COMMON.ALL_DAY.CHECK')} - ${it.title}`;

        if (it.repeat === FrequencyEnum.none) {
          const end = getEnd(start, it.duration);
          return monthEvent(title, start, end, it.unavailableId, findStateColor('DEFAULT', darkMode),
            new Meta(!!it.duration, this.timeZone, 'UNAVAILABLE', [this.language, 'unavailable', it.unavailableId]),
            darkMode,
          );
        } else {
          this.calendar.recurringEvent?.addFrequency(it.repeat, start, it.unavailableId, title, 'UNAVAILABLE',
            `${this.language}/unavailable/`, (date, recurring) => this.createEvent(date, recurring, darkMode),
            getDurationOrUndefined(it.duration), undefined, it.allDay,
          );
          return undefined;
        }
      });

      const birthdayEvents = calendarSummary.birthdays?.map(it => {
        const startDate = newDateTimestamp(it.date);
        startDate.setFullYear(getNowTimeZone(this.timeZone).getFullYear());
        const color = findStateColor('BIRTHDAY', darkMode);
        return allDayEvent(it.title, color, startDate, darkMode, `${this.language}/users/${it.userId}`,
          new Meta(false, this.timeZone, 'BIRTHDAY', [this.language, 'users', it.userId]),
        );
      });

      const transactionEvents = calendarSummary.transactions?.map(it => {
        const startDate = newDateTimestamp(it.createdAt);
        startDate.setFullYear(getNowTimeZone(this.timeZone).getFullYear());
        const color = findStateColor('TRANSACTION', darkMode);
        return allDayEvent(it.title, color, startDate, darkMode,
          `${this.language}/accounts/${it.accountId}/transactions/ ${it.transactionId}`,
          new Meta(false, this.timeZone, 'TRANSACTION',
            [this.language, 'accounts', it.accountId, 'transactions', it.transactionId], undefined, it.total,
          ),
        );
      });

      const noteEvents = calendarSummary.notes.map(it => {
        const startDate = newDateTimestamp(it.date, this.timeZone);
        if (it.repeat === FrequencyEnum.none) {
          return this.createNoteEvent(it, startDate, darkMode);
        }
        let repeatDate: Date;
        if (this.calendar.calendarStart && greaterOrEqualsThan(this.calendar.calendarStart, startDate)) {
          repeatDate = new Date(this.calendar.calendarStart);
          repeatDate.setDate(startDate.getDate());
        } else {
          repeatDate = startDate;
        }
        this.calendar.recurringEvent?.addFrequency(it.repeat, repeatDate, it.noteId, it.title, 'NOTE',
          `${this.language}/notes/`,
          (date, recurring) => this.createEvent(date, recurring, darkMode), undefined, undefined, true,
        );
        return undefined;
      });

      const allEvents = [...reservationEvents, ...unavailableEvents, ...birthdayEvents, ...transactionEvents,
        ...noteEvents].filter(it => it !== undefined);
      this.calendar.addEvents(allEvents);
      this.calendar.recurringEvent?.execute();
    }
    this.calendar.sortEvents();
  };

  private createEvent = (date: Date, recurring: any, darkMode: boolean) => {
    const end = getEndWithDuration(date, recurring.duration);
    const meta = new Meta(!!recurring.duration, this.timeZone, recurring.state, [recurring.path, recurring.id]);
    const event = monthEvent(recurring.title, date, end, recurring.id, findStateColor(recurring.state, darkMode),
      meta, darkMode, recurring.allDay,
    );
    this.calendar.addEvent(event);
  };

  private createNoteEvent = (note: ICalendarNote, date: Date, darkMode: boolean): CalendarEvent => {
    const color = findStateColor('NOTE', darkMode);
    return allDayEvent(note.title, color, date, darkMode, `${this.language}/notes/${note.noteId}`,
      new Meta(false, this.timeZone, 'NOTE', [this.language, 'notes', note.noteId]),
    );
  };
}
