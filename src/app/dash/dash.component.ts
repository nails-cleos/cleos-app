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
import { getEnd, getNow, newDateTimestamp } from '../util/dates';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { findStateColor, isDarkMode } from '../util/theme';
import { getFrequency, Meta, monthEvent } from '../util/event';
import { Router } from '@angular/router';
import { isSameDay, isSameMonth } from 'date-fns';
import { ICalendarReservations, ICalendarUnavailable, IChart, IDashboard } from '../interfaces/dashboard';
import { UnavailableRepeatType } from '../interfaces/unavailable';
import { UntypedFormControl } from '@angular/forms';
import { IAuthority } from '../interfaces/user';
import { Role } from '../interfaces/token';
import { IRoom } from '../interfaces/room';
import { CalendarDialogComponent } from '../shared/calendar-dialog/calendar-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.scss']
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
  activeDayIsOpen = false;
  dateFormat: string;
  events: CalendarEvent[] = [];
  isCalendarLoading = true;
  isLoading: any;
  totalReservation: number;
  isDarkMode?: boolean;

  miniCardData: IReservationSummary[] = [{} as IReservationSummary, {} as IReservationSummary,
    {} as IReservationSummary, {} as IReservationSummary];

  charts: IChart[] = [{} as IChart, {} as IChart, {} as IChart,
    {} as IChart, {} as IChart, {} as IChart, {} as IChart, {} as IChart];

  cardLayout = {
    columns: 2,
    miniCard: { cols: 1, rows: 1 },
    calendar: { cols: 2, rows: 4 },
    chart: { cols: 2, rows: 2 },
    table: { cols: 2, rows: 4 }
  };

  private destroy$ = new Subject();
  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(public dialog: MatDialog, private breakpointObserver: BreakpointObserver, private store: Store<AppState>,
              private readonly translate: TranslateService, private router: Router) {
    this.getState = this.store.select(selectDashboardState);
    this.store.select(selectAuthState).subscribe((state: any) => {
      const darkMode: boolean = isDarkMode(state.user?.theme);
      if (this.isDarkMode !== undefined && darkMode !== this.isDarkMode) {
        this.createEvents(darkMode);
      }
      this.isDarkMode = darkMode;
      const isManager = state.user?.authorities?.some((au: IAuthority) => [Role.admin as string, Role.manager as string]
        .includes(au.authority));
      this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
        .pipe(takeUntil(this.destroy$)).subscribe((breakpointState: BreakpointState) => {
        if (breakpointState.breakpoints[Breakpoints.Medium]) {
          this.cardLayout = {
            columns: 2,
            miniCard: isManager ? { cols: 1, rows: 1 } : { cols: 0, rows: 0 },
            calendar: { cols: 2, rows: 4 },
            chart: { cols: 2, rows: 2 },
            table: { cols: 2, rows: 4 }
          };
        } else if (breakpointState.matches) {
          this.cardLayout = {
            columns: 1,
            miniCard: isManager ? { cols: 1, rows: 1 } : { cols: 0, rows: 0 },
            calendar: { cols: 1, rows: 4 },
            chart: { cols: 1, rows: 1.5 },
            table: { cols: 1, rows: 4.5 }
          };
        } else {
          this.cardLayout = {
            columns: 4,
            miniCard: isManager ? { cols: 1, rows: 1 } : { cols: 0, rows: 0 },
            calendar: { cols: 4, rows: 4 },
            chart: { cols: 2, rows: 2 },
            table: { cols: 4, rows: 4 }
          };
        }
      });
    });
    this.viewDate = getNow();
    this.dateFormat = this.translate.currentLang;
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

  get closeOpenMonthViewDay(): void {
    this.activeDayIsOpen = false;
    return;
  }

  get changeDate(): void {
    return this.getSummaries();
  }

  private static createErrorMiniCard(title: string, message: string): IReservationSummary {
    return {
      title: `DASHBOARD.MINI_CARD.${ title }`,
      error: {
        status: message
      }
    };
  }

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
  }

  handleEvent(event: CalendarEvent): void {
    this.router.navigate(event.meta.route);
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.activeDayIsOpen = !((isSameDay(this.viewDate, date) && this.activeDayIsOpen) || events.length === 0);
      this.viewDate = date;
    }
    if (!this.activeDayIsOpen) {
      const room = { id: this.roomId };
      this.segmentClick(date, room);
    }
  }

  cellClick(date: any): void {
    const room = { id: this.roomId };
    this.segmentClick(date, room);
  }

  private segmentClick(date: Date, room?: IRoom): void {
    const data = { date, room };
    if (date && room) {
      const dialogRef = this.dialog.open(CalendarDialogComponent);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate(result.split(','), { state: data });
        }
      });
    }
  }

  private createDashboards(): void {
    if (this.selectedDash) {
      const state: IDashboard | undefined = this.mapDashboard?.get(this.selectedDash.value);
      if (state) {
        this.error = state.error;
        this.roomId = state.roomId;
        this.professionalId = state.professionalId;
        this.state = state;
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
            this.miniCardData = state.miniCardSummaries;
          } else {
            this.miniCardError('NO_CONTENT');
          }
        }
      }
    }
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsReservation.Clean()
    );
    this.store.dispatch(
      new fromActionsDashboard.Clean()
    );
  }

  private miniCardError(error: string): void {
    const revenue = DashComponent.createErrorMiniCard('TOTAL_TREATMENT_SALES', error);

    const treatments = DashComponent.createErrorMiniCard('AVERAGE_TREATMENT_VALUE', error);

    const totalTreatments = DashComponent.createErrorMiniCard('TOTAL_TREATMENTS', error);

    const customer = DashComponent.createErrorMiniCard('NEW_CUSTOMERS_RESERVATION', error);
    this.miniCardData = [revenue, treatments, totalTreatments, customer];
  }

  private subscribe(): void {
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
      } else {
        // @ts-ignore
        const [firstKey] = this.mapDashboard?.keys();
        if (firstKey) {
          this.selectedDash.setValue(firstKey);
        }
      }
    });
  }

  private createEvents(darkMode: boolean = false): void {
    this.events = [];
    if (this.state.calendarSummary) {
      this.state.calendarSummary.reservations?.forEach((it: ICalendarReservations) => {
        const start = newDateTimestamp(it.start);
        const end = it.end ? newDateTimestamp(it.end) : null;
        this.activeDayIsOpen = this.activeDayIsOpen ? this.activeDayIsOpen : isSameDay(start, getNow());

        const event = monthEvent(it.title, start, end, it.reservationId, findStateColor(it.state, darkMode),
          new Meta(true, this.state.timeZone, it.state, ['reservation', it.reservationId]), darkMode);
        if (event) {
          this.events = [...this.events, event];
        }
      });
      let recurring: any[] = [];
      this.state.calendarSummary.unavailable?.forEach((it: ICalendarUnavailable) => {
        const start = newDateTimestamp(it.start);
        this.activeDayIsOpen = this.activeDayIsOpen ? this.activeDayIsOpen : isSameDay(start, getNow());
        const title = it.duration ? it.title : `${ this.translate.instant('COMMON.ALL_DAY.CHECK') } - ${ it.title }`;

        if (it.repeat === UnavailableRepeatType.none) {
          const end = getEnd(start, it.duration);
          const event = monthEvent(title, start, end, it.unavailableId, findStateColor('DEFAULT', darkMode),
            new Meta(!!it.duration, this.state.timeZone, undefined, ['unavailable', it.unavailableId]), darkMode);
          if (event) {
            this.events = [...this.events, event];
          }
        } else {
          recurring = [...recurring, getFrequency(it.repeat, start, it.unavailableId, title, it.end, it.duration)];
        }
      });

      recurring.forEach(r =>
        r.rule.all().forEach((date: Date) => {
          const end = getEnd(date, r.duration);
          const event = monthEvent(r.title, date, end, r.unavailableId, findStateColor('DEFAULT', darkMode),
            new Meta(!!r.duration, this.state.timeZone, undefined, ['unavailable', r.unavailableId]), darkMode);
          if (event) {
            this.events = [...this.events, event];
          }
        }));

      this.isCalendarLoading = false;
    }
  }

  private getSummaries(): void {
    this.getEvents();
    this.isLoading = true;
    this.store.dispatch(
      new fromActionsDashboard.GetCards(this.viewDate)
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
