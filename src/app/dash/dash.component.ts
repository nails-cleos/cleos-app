import { Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable, Subject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectDashboardState } from '../store/app.states';
import * as fromActionsDashboard from '../store/dashboard.actions';
import * as fromActionsReservation from '../store/reservation.actions';
import { IReservationSummary, States } from '../interfaces/reservation';
import { TranslateService } from '@ngx-translate/core';
import { createNewDate, getEnd, getNow, getWeekDay, newDate, plusMonthDate } from '../util/dates';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { findStateColor, isDarkMode } from '../util/theme';
import { Meta, monthEvent } from '../util/event';
import { Router } from '@angular/router';
import { addDays, isSameDay, isSameMonth } from 'date-fns';
import { ICalendarReservations, ICalendarUnavailable, IChart } from '../interfaces/dashboard';
import RRule, { ByWeekday } from 'rrule';
import { UnavailableRepeatType } from '../interfaces/unavailable';
import { Frequency } from 'rrule/dist/esm/src/types';

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.scss']
})
export class DashComponent implements OnInit, OnDestroy {
  state: any;

  view: CalendarView = CalendarView.Month;
  viewDate: Date;
  activeDayIsOpen = false;
  locale: string;
  events: CalendarEvent[] = [];
  isCalendarLoading = true;
  totalReservation: number;
  isDarkMode?: boolean;

  miniCardData: IReservationSummary[] = [{} as IReservationSummary, {} as IReservationSummary,
    {} as IReservationSummary, {} as IReservationSummary];

  charts: IChart[] = [{} as IChart, {} as IChart, {} as IChart,
    {} as IChart, {} as IChart, {} as IChart, {} as IChart, {} as IChart];

  cardLayout = {
    columns: 2,
    miniCard: {cols: 1, rows: 1},
    calendar: {cols: 2, rows: 4},
    chart: {cols: 2, rows: 2},
    table: {cols: 2, rows: 4}
  };

  private destroy$ = new Subject();
  private getState: Observable<any>;
  private subscription: Subscription | undefined;

  constructor(private breakpointObserver: BreakpointObserver, private store: Store<AppState>,
              private readonly translate: TranslateService, private router: Router) {
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
      .pipe(takeUntil(this.destroy$)).subscribe((state: BreakpointState) => {
      if (state.breakpoints[Breakpoints.Medium]) {
        this.cardLayout = {
          columns: 2,
          miniCard: {cols: 1, rows: 1},
          calendar: {cols: 2, rows: 4},
          chart: {cols: 2, rows: 2},
          table: {cols: 2, rows: 4}
        };
      } else if (state.matches) {
        this.cardLayout = {
          columns: 1,
          miniCard: {cols: 1, rows: 1},
          calendar: {cols: 1, rows: 4},
          chart: {cols: 1, rows: 2},
          table: {cols: 1, rows: 3}
        };
      } else {
        this.cardLayout = {
          columns: 4,
          miniCard: {cols: 1, rows: 1},
          calendar: {cols: 4, rows: 4},
          chart: {cols: 2, rows: 2},
          table: {cols: 4, rows: 4}
        };
      }
    });
    this.getState = this.store.select(selectDashboardState);
    this.store.select(selectAuthState).subscribe((state: any) => {
      const darkMode: boolean = isDarkMode(state.user?.theme);
      if (this.isDarkMode !== undefined && darkMode !== this.isDarkMode) {
        this.createEvents(darkMode);
      }
      this.isDarkMode = darkMode;
    });
    this.viewDate = getNow();
    this.locale = this.translate.currentLang;
    this.totalReservation = 0;
  }

  get completed(): number {
    return this.events?.filter((event: CalendarEvent) => event.meta.state === States.completed
      && isSameMonth(event.start, this.viewDate)).length;
  }

  get upcoming(): number {
    return this.events?.filter((event: CalendarEvent) => event.meta.state && event.meta.state !== States.completed
      && event.meta.state !== States.cancelled && isSameMonth(event.start, this.viewDate)).length;
  }

  private static createErrorMiniCard(title: string, message: string): IReservationSummary {
    return {
      title: `DASHBOARD.MINI_CARD.${title}`,
      error: {
        status: message
      }
    };
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
    this.getSummaries();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.destroy$.next();
  }

  handleEvent(event: CalendarEvent): void {
    this.router.navigate(event.meta.route);
  }

  dayClicked({date, events}: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.activeDayIsOpen = !((isSameDay(this.viewDate, date) && this.activeDayIsOpen) || events.length === 0);
      this.viewDate = date;
    }
  }

  closeOpenMonthViewDay(): void {
    this.activeDayIsOpen = false;
  }

  changeDate(): void {
    this.getEvents();
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsReservation.Clean()
    );
    this.store.dispatch(
      new fromActionsDashboard.Clean()
    );
  }

  private miniCardError(state: any, error: string): void {
    this.state = state;
    const revenue = DashComponent.createErrorMiniCard('TOTAL_PRODUCT_SALES', error);

    const products = DashComponent.createErrorMiniCard('AVERAGE_PRODUCT_VALUE', error);

    const totalProducts = DashComponent.createErrorMiniCard('TOTAL_PRODUCTS', error);

    const customer = DashComponent.createErrorMiniCard('NEW_CUSTOMERS_RESERVATION', error);
    this.miniCardData = [revenue, products, totalProducts, customer];
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.errorMessage) {
        this.miniCardError(state, state.errorMessage);
        this.state = state;
      }
      if (state.data && (state.data.miniCardSummaries || state.data.chartSummaries || state.data.calendarSummary)) {
        this.state = state;
        if (!this.events.length && state.data.calendarSummary) {
          this.createEvents(this.isDarkMode);
        }
        if (state.data.miniCardSummaries || state.data.chartSummaries) {
          if (state.data.chartSummaries && state.data.chartSummaries.length) {
            this.charts = state.data.chartSummaries;
          }
          if (state.data.miniCardSummaries && state.data.miniCardSummaries.length) {
            this.miniCardData = state.data.miniCardSummaries;
          } else {
            this.miniCardError(state, 'NO_CONTENT');
            this.isCalendarLoading = false;
          }
        }
      }
    });
  }

  private createEvents(darkMode: boolean = false): void {
    this.events = [];
    this.state.data?.calendarSummary.reservations?.forEach((it: ICalendarReservations) => {
      const start = newDate(it.start);
      const end = it.end ? newDate(it.end) : null;
      this.activeDayIsOpen = this.activeDayIsOpen ? this.activeDayIsOpen : isSameDay(start, getNow());

      const event = monthEvent(it.title, start, end, it.reservationId, findStateColor(it.state, darkMode),
        new Meta(true, it.state, ['reservation', it.reservationId]));
      if (event) {
        this.events = [...this.events, event];
      }
    });
    let recurring: any[] = [];
    this.state.data?.calendarSummary.unavailable?.forEach((it: ICalendarUnavailable) => {
      const start = newDate(it.start);
      this.activeDayIsOpen = this.activeDayIsOpen ? this.activeDayIsOpen : isSameDay(start, getNow());
      const title = it.duration ? it.title : `${this.translate.instant('UNAVAILABLE.ALL_DAY.CHECK')} - ${it.title}`;

      if (it.repeat === UnavailableRepeatType.none) {
        const end = getEnd(start, it.duration);
        const event = monthEvent(title, start, end, it.unavailableId, findStateColor('DEFAULT', darkMode),
          new Meta(!!it.duration, undefined, ['unavailable', it.unavailableId]));
        if (event) {
          this.events = [...this.events, event];
        }
      } else {
        let freq: Frequency | undefined;
        let byweekday: ByWeekday | undefined;
        switch (it.repeat) {
          case UnavailableRepeatType.onceAWeek:
            freq = RRule.WEEKLY;
            byweekday = getWeekDay(start.getDay());
            break;
          case UnavailableRepeatType.everyDay:
            freq = RRule.DAILY;
            break;
        }
        recurring = [...recurring, {
          unavailableId: it.unavailableId,
          title,
          duration: it.duration,
          rule: new RRule({
            freq,
            byweekday,
            dtstart: start,
            until: addDays(newDate(it.end), 1)
          })
        }];
      }
    });

    recurring.forEach(r =>
      r.rule.all().forEach((date: Date) => {
        const end = getEnd(date, r.duration);
        const event = monthEvent(r.title, date, end, r.unavailableId, findStateColor('DEFAULT', darkMode),
          new Meta(!!r.duration, undefined, ['unavailable', r.unavailableId]));
        if (event) {
          this.events = [...this.events, event];
        }
      }));

    this.isCalendarLoading = false;
  }

  private getSummaries(): void {
    this.getEvents();
    this.store.dispatch(
      new fromActionsDashboard.GetCards()
    );
  }

  private getEvents(): void {
    this.events = [];
    this.isCalendarLoading = true;
    this.store.dispatch(
      new fromActionsDashboard.GetEvents(this.viewDate)
    );
  }
}
