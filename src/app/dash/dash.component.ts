import { Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable, Subject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectDashboardState } from '../store/app.states';
import * as fromActionsDashboard from '../store/dashboard.actions';
import * as fromActionsReservation from '../store/reservation.actions';
import { IReservationSummary, States } from '../interfaces/reservation';
import { TranslateService } from '@ngx-translate/core';
import {
  getDurationOrUndefined,
  getEnd,
  getEndWithDuration,
  getNowTimeZone,
  greaterOrEqualsThan,
  newDateTimestamp
} from '../util/dates';
import { CalendarEvent, CalendarModule, CalendarMonthViewDay, CalendarView } from 'angular-calendar';
import { findStateColor, getStateOrder } from '../util/theme';
import { allDayEvent, getFrequency, IMeta, Meta, monthEvent } from '../util/event';
import { Router } from '@angular/router';
import { addDays, isSameDay, isSameMonth, startOfMonth } from 'date-fns';
import { ICalendarNote, ICalendarSummary, IChart, IDashboard } from '../interfaces/dashboard';
import { UntypedFormControl } from '@angular/forms';
import { IRoom } from '../interfaces/room';
import { CalendarDialogComponent } from '../shared/dialog/calendar/calendar-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { executeDialogNoWidth, FrequencyEnum } from '../util/helper';
import { numberFormat } from '../util/numbers';
import { ICurrency } from '../interfaces/currency';
import { AuthUserService } from '../services/auth-user.service';
import { SharedModule } from "../shared/shared.module";
import { MiniCardComponent } from "./mini-card/mini-card.component";
import { ReservationTableComponent } from "./reservation/table/reservation-table.component";
import { CardComponent } from "../shared/card/card.component";
import { ChartComponent } from "../shared/chart/chart.component";

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.scss'],
  standalone: true,
  imports: [SharedModule, CalendarModule, MiniCardComponent, ReservationTableComponent, CardComponent, ChartComponent],
})
export class DashComponent implements OnInit, OnDestroy {
  state: any;
  error: any;
  mapDashboard?: Map<string, IDashboard>;
  selectedDash = new UntypedFormControl();
  roomId?: string;
  professionalId?: string;

  view: CalendarView = CalendarView.Month;
  viewDate: Date;
  activeDayIsOpen: boolean;
  dateFormat: string;
  events: CalendarEvent[] = [];
  isCalendarLoading = true;
  isLoading: any;
  totalReservation: number;

  currency?: ICurrency;
  all?: boolean;
  timeZone?: string;
  thisMonthTotal: string;

  miniCardData: IReservationSummary[] = [{} as IReservationSummary, {} as IReservationSummary,
    {} as IReservationSummary, {} as IReservationSummary];

  charts: IChart[] = [{} as IChart, {} as IChart, {} as IChart,
    {} as IChart, {} as IChart, {} as IChart, {} as IChart, {} as IChart];

  cardLayout = {
    columns: 2,
    rowHeight: '250px',
    miniCard: { cols: 1, rows: 1 },
    calendar: { cols: 2, rows: 4 },
    chart: { cols: 2, rows: 2 },
    table: { cols: 2, rows: 4 }
  };

  private destroy$ = new Subject();
  private getState: Observable<any>;
  private subscription?: Subscription;
  private authUserServiceSubscription: Subscription;
  private isDarkMode?: boolean;
  private periodStart?: Date;
  private readonly language: string;

  constructor(public dialog: MatDialog, private breakpointObserver: BreakpointObserver, private store: Store<AppState>,
              private readonly translate: TranslateService, private router: Router,
              private authUserService: AuthUserService) {
    this.getState = this.store.select(selectDashboardState);
    this.authUserServiceSubscription = this.authUserService.authUser.subscribe(value => {
      const darkMode: boolean = value.isDarkMode;
      if (this.isDarkMode !== undefined && darkMode !== this.isDarkMode) {
        this.createEvents(darkMode);
      }
      this.isDarkMode = darkMode;
      const isAdminOrManager = value.isAdmin || value.isManager;
      const miniCard = isAdminOrManager ? { cols: 1, rows: 1 } : { cols: 0, rows: 0 };
      this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
        .pipe(takeUntil(this.destroy$)).subscribe((breakpointState: BreakpointState) => {
        if (breakpointState.breakpoints[Breakpoints.Medium]) {
          this.cardLayout = {
            columns: 2,
            rowHeight: '250px',
            miniCard,
            calendar: { cols: 2, rows: 4 },
            chart: { cols: 2, rows: 2 },
            table: { cols: 2, rows: 4 }
          };
        } else if (breakpointState.matches) {
          this.cardLayout = {
            columns: 1,
            rowHeight: '250px',
            miniCard,
            calendar: { cols: 1, rows: 4 },
            chart: { cols: 1, rows: 1.5 },
            table: { cols: 1, rows: 4.5 }
          };
        } else {
          this.cardLayout = {
            columns: 4,
            rowHeight: '250px',
            miniCard,
            calendar: { cols: 4, rows: 4 },
            chart: { cols: 2, rows: 2 },
            table: { cols: 4, rows: 4 }
          };
        }
      });
    });
    const extras = this.router.getCurrentNavigation()?.extras.state;
    if (extras?.date) {
      this.viewDate = extras.date;
      this.activeDayIsOpen = true;
    } else {
      this.viewDate = getNowTimeZone(this.timeZone);
      this.activeDayIsOpen = false;
    }
    this.dateFormat = this.translate.currentLang;
    this.language = this.translate.currentLang;
    this.totalReservation = 0;
    this.thisMonthTotal = numberFormat(0, this.currency, this.dateFormat);
  }

  get completed(): number {
    return this.events?.filter((event: CalendarEvent) => DashComponent.completedByMonth(event, this.viewDate)).length;
  }

  get completedTotal(): string {
    const total = this.events?.filter((event: CalendarEvent) => DashComponent.completedByMonth(event, this.viewDate))
      .reduce((a, b) => a + b.meta.total || 0, 0);

    return numberFormat(total, this.currency, this.dateFormat);
  }

  get upcoming(): number {
    return this.events?.filter((event: CalendarEvent) => DashComponent.upcomingByMonth(event, this.viewDate)).length;
  }

  get upcomingTotal(): string {
    const total = this.events?.filter((event: CalendarEvent) => DashComponent.upcomingByMonth(event, this.viewDate))
      .reduce((a, b) => a + b.meta.total || 0, 0);

    return numberFormat(total, this.currency, this.dateFormat);
  }

  get transaction(): number {
    return this.events?.filter((event: CalendarEvent) => DashComponent.transactionByMonth(event, this.viewDate)).length;
  }

  get transactionTotal(): string {
    const total = this.events?.filter((event: CalendarEvent) => DashComponent.transactionByMonth(event, this.viewDate))
      .reduce((a, b) => a + b.meta.total || 0, 0);

    return numberFormat(total, this.currency, this.dateFormat);
  }

  get closeOpenMonthViewDay(): void {
    this.activeDayIsOpen = false;
    return;
  }

  get changeDate(): void {
    return this.getSummaries();
  }

  private static createErrorMiniCard = (title: string, message: string): IReservationSummary => ({
    title: `DASHBOARD.MINI_CARD.${ title }`,
    error: {
      status: message
    }
  })

  private static completedByMonth = (
    event: CalendarEvent,
    viewDate: Date
  ): boolean => event.meta.state === States.completed && isSameMonth(event.start, viewDate)

  private static upcomingByMonth = (
    event: CalendarEvent,
    viewDate: Date
  ): boolean => isSameMonth(event.start, viewDate) && event.meta.state
    && [States.created, States.approved, States.partiallyPaid, States.paid].includes(event.meta.state)

  private static transactionByMonth = (
    event: CalendarEvent,
    viewDate: Date
  ): boolean => event.meta.state === 'TRANSACTION' && isSameMonth(event.start, viewDate)

  ngOnInit(): void {
    this.clean();
    this.subscribe();
    this.getSummaries();
    this.selectedDash.valueChanges.subscribe(value => {
      if (value) {
        this.isCalendarLoading = true;
        this.isLoading = true;
        setTimeout(() => {
          this.createDashboards();
        }, 1000);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.destroy$.unsubscribe();
    this.authUserServiceSubscription.unsubscribe();
  }

  handleEvent = (event: CalendarEvent): void => {
    this.router.navigate(event.meta.route);
  }

  dayClicked = ({ date, events }: { date: Date; events: CalendarEvent[] }): void => {
    if (isSameMonth(date, this.viewDate)) {
      this.activeDayIsOpen = !((isSameDay(this.viewDate, date) && this.activeDayIsOpen) || events.length === 0);
      this.viewDate = date;
    }
    if (events.length === 0) {
      const room = { id: this.roomId };
      this.segmentClick(date, room);
    }
  }

  cellClick = (date: any): void => {
    const room = { id: this.roomId };
    this.segmentClick(date, room);
  }

  beforeMonthViewRender = ({ body, period }: { body: CalendarMonthViewDay<IMeta>[]; period: any }): void => {
    // month view has a different UX from the week and day view, so we only really need to group by the type
    this.periodStart = period.start;
    body.forEach((cell) => {
      const groups = {};
      cell.events.forEach((event: CalendarEvent<IMeta>) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        groups[event.meta?.state] = groups[event.meta?.state] || [];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        groups[event.meta?.state].push(event);
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      cell.eventGroups = Object.entries(groups);
    });
  }

  sortBy = (eventGroups: CalendarEvent<IMeta>[]): any => eventGroups.sort(
    (a: any, b: any) => getStateOrder(a[0]) - getStateOrder(b[0]))

  private segmentClick = (date: Date, room?: IRoom): void => {
    const data = { date };
    if (date && room) {
      executeDialogNoWidth(this.dialog, CalendarDialogComponent, null, result => {
        if (result) {
          this.router.navigate([this.language].concat(result.split(',')), { state: data });
        }
      });
    }
  }

  private createDashboards = (): void => {
    if (this.selectedDash) {
      const state: IDashboard | undefined = this.mapDashboard?.get(this.selectedDash.value);
      if (state) {
        this.error = state.error;
        this.roomId = state.roomId;
        this.professionalId = state.professionalId;
        this.currency = state.currency;
        this.state = state;
        this.all = state.all;
        this.timeZone = state.timeZone;
        this.thisMonthTotal = numberFormat(state.thisMonthTotal || 0, this.currency, this.dateFormat);
        this.createEvents(this.isDarkMode);
        if (!state.chartSummaries && !state.miniCardSummaries) {
          this.isLoading = false;
          this.charts = [{} as IChart, {} as IChart, {} as IChart,
            {} as IChart, {} as IChart, {} as IChart, {} as IChart, {} as IChart];
          this.miniCardError('NO_CONTENT');
        } else {
          if (state.chartSummaries && state.chartSummaries.length) {
            this.charts = state.chartSummaries;
            this.isLoading = false;
          } else {
            if (state.error) {
              this.isLoading = false;
            }
            this.charts = [{} as IChart, {} as IChart, {} as IChart,
              {} as IChart, {} as IChart, {} as IChart, {} as IChart, {} as IChart];
          }
          if (state.miniCardSummaries && state.miniCardSummaries.length) {
            this.miniCardData = state.miniCardSummaries.map(miniCard => {
              if (miniCard.isCurrency && miniCard.value) {
                let value;
                let previousPeriodValue;
                if (miniCard.value) {
                  value = numberFormat(miniCard.value, this.currency, this.dateFormat);
                }
                if (miniCard.previousPeriodValue) {
                  previousPeriodValue = numberFormat(miniCard.previousPeriodValue, this.currency, this.dateFormat);
                }
                return Object.assign({}, miniCard, { value, previousPeriodValue });
              }
              return miniCard;
            });
          } else {
            this.miniCardError('NO_CONTENT');
          }
        }
      }
    }
  }

  private clean = (): void => {
    this.store.dispatch(
      new fromActionsReservation.Clean()
    );
    this.store.dispatch(
      new fromActionsDashboard.Clean()
    );
  }

  private miniCardError = (error: string): void => {
    const revenue = DashComponent.createErrorMiniCard('TOTAL_TREATMENT_SALES', error);

    const treatments = DashComponent.createErrorMiniCard('AVERAGE_TREATMENT_VALUE', error);

    const totalTreatments = DashComponent.createErrorMiniCard('TOTAL_TREATMENTS', error);

    const customer = DashComponent.createErrorMiniCard('NEW_CUSTOMERS_RESERVATION', error);
    this.miniCardData = [revenue, treatments, totalTreatments, customer];
  }

  private createEvents = (darkMode: boolean = false): void => {
    this.events = [];
    if (this.state.calendarSummary) {
      const calendarSummary: ICalendarSummary = this.state.calendarSummary;
      calendarSummary.reservations?.forEach(it => {
        const start = newDateTimestamp(it.start);
        const end = it.end ? newDateTimestamp(it.end) : null;
        this.activeDayIsOpen = this.activeDayIsOpen
          ? this.activeDayIsOpen : isSameDay(start, getNowTimeZone(this.timeZone));

        const event = monthEvent(it.title, start, end, it.reservationId, findStateColor(it.state, darkMode),
          new Meta(true, this.timeZone, it.state, [this.language, 'reservation', it.reservationId], undefined,
            it.total), darkMode);
        if (event) {
          this.events = [...this.events, event];
        }
      });
      let recurring: any[] = [];
      const calendarStart = addDays(startOfMonth(this.viewDate), -7);
      calendarSummary.unavailable?.forEach(it => {
        if (it.type === 'BLOCK_AGENDA') {
          return;
        }
        const start = newDateTimestamp(it.start);
        this.activeDayIsOpen = this.activeDayIsOpen
          ? this.activeDayIsOpen : isSameDay(start, getNowTimeZone(this.timeZone));
        const title = it.duration ? it.title : `${ this.translate.instant('COMMON.ALL_DAY.CHECK') } - ${ it.title }`;

        if (it.repeat === FrequencyEnum.none) {
          const end = getEnd(start, it.duration);
          const event = monthEvent(title, start, end, it.unavailableId, findStateColor('DEFAULT', darkMode),
            new Meta(!!it.duration, this.timeZone, 'UNAVAILABLE', [this.language, 'unavailable', it.unavailableId]),
            darkMode);
          if (event) {
            this.events = [...this.events, event];
          }
        } else {
          recurring = [...recurring, getFrequency(it.repeat, start, it.unavailableId, title, 45, 'UNAVAILABLE',
            `${ this.language }/unavailable`, it.end, getDurationOrUndefined(it.duration), it.allDay, undefined,
            calendarStart)];
        }
      });

      calendarSummary.birthdays?.forEach(it => {
        const startDate = newDateTimestamp(it.date);
        startDate.setFullYear(getNowTimeZone(this.timeZone).getFullYear());
        const color = findStateColor('BIRTHDAY', darkMode);
        const event = allDayEvent(it.title, color, startDate, darkMode, `${ this.language }/users/${ it.userId }`,
          new Meta(false, this.timeZone, 'BIRTHDAY', [this.language, 'users', it.userId]));
        this.events = [...this.events, event];
      });

      calendarSummary.transactions?.forEach(it => {
        const startDate = newDateTimestamp(it.createdAt);
        startDate.setFullYear(getNowTimeZone(this.timeZone).getFullYear());
        const color = findStateColor('TRANSACTION', darkMode);
        const event = allDayEvent(it.title, color, startDate, darkMode,
          `${ this.language }/accounts/${ it.accountId }/transactions/ ${ it.transactionId }`,
          new Meta(false, this.timeZone, 'TRANSACTION',
            [this.language, 'accounts', it.accountId, 'transactions', it.transactionId], undefined, it.total));
        this.events = [...this.events, event];
      });

      calendarSummary.notes.forEach(it => {
        const startDate = newDateTimestamp(it.date, this.timeZone);
        if (it.repeat === FrequencyEnum.none) {
          this.createNoteEvent(it, startDate, darkMode);
        } else {
          let repeatDate: Date;
          if (this.periodStart && greaterOrEqualsThan(this.periodStart, startDate)) {
            repeatDate = this.periodStart;
            repeatDate.setDate(startDate.getDate());
          } else {
            repeatDate = startDate;
          }
          recurring = [...recurring, getFrequency(it.repeat, repeatDate, it.noteId, it.title, 45, 'NOTE',
            `${ this.language }/notes`, undefined, undefined, true, undefined, calendarStart)];
        }
      });

      recurring.forEach(r =>
        r.rule.all().forEach((date: Date) => {
          const end = getEndWithDuration(date, r.duration);
          const event = monthEvent(r.title, date, end, r.id, findStateColor(r.state, darkMode),
            new Meta(!!r.duration, this.timeZone, r.state, [r.path, r.id]), darkMode);
          if (event) {
            this.events = [...this.events, event];
          }
        }));

      this.isCalendarLoading = false;
    }
    this.events = this.events.slice().sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  private createNoteEvent = (note: ICalendarNote, date: Date, darkMode: boolean): void => {
    const color = findStateColor('NOTE', darkMode);
    const event = allDayEvent(note.title, color, date, darkMode, `${ this.language }/notes/${ note.noteId }`,
      new Meta(false, this.timeZone, 'NOTE', [this.language, 'notes', note.noteId]));
    this.events = [...this.events, event];
  }

  private getSummaries = (): void => {
    this.getEvents();
    this.isLoading = true;
    this.store.dispatch(
      new fromActionsDashboard.GetCards(this.viewDate)
    );
  }

  private getEvents = (): void => {
    this.events = [];
    this.isCalendarLoading = true;
    this.store.dispatch(
      new fromActionsDashboard.GetEvents(this.viewDate)
    );
  }

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      if (state.errorMessage) {
        this.state = state;
        this.error = state.errorMessage;
        this.miniCardError(state.errorMessage);
      }
      this.mapDashboard = state.data;
      if (state.data) {
        this.isCalendarLoading = false;
      }
      if (this.selectedDash.value) {
        this.createDashboards();
      } else if (this.mapDashboard) {
        this.mapDashboard.forEach((value, key) => {
          if (value?.primary) {
            this.selectedDash.setValue(key);
          }
        });
      }
    });
  }
}
