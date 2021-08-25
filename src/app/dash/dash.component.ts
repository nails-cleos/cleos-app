import { Component, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectReservationState } from '../store/app.states';
import * as fromActionsReservation from '../store/reservation.actions';
import { IReservationAll, IReservationSummary, States } from '../interfaces/reservation';
import { IUserAll } from '../interfaces/user';
import { TranslateService } from '@ngx-translate/core';
import { ThemePalette } from '@angular/material/core';
import { convertDuration, createDate, getNow, newDate, plusMonth } from '../util/dates';
import { getPrice, getUserName } from '../util/helper';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { findStateColor, isDarkMode } from '../util/theme';
import { monthEvent } from '../util/event';
import { Router } from '@angular/router';
import { isSameDay, isSameMonth } from 'date-fns';

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.scss']
})
export class DashComponent implements OnInit, OnDestroy {
  state: any;
  stateTracking: any;
  annualLabel: any;
  customerLabel: any;
  quantityLabel: any;
  lastMonthLabel: any;
  trackingAverage: any;
  trackingCompare: any;

  view: CalendarView = CalendarView.Month;
  viewDate: Date;
  activeDayIsOpen = false;
  locale: string;
  events: CalendarEvent[] = [];
  isCalendarLoading = true;
  totalReservation: number;

  miniCardData: IReservationSummary[] = [{} as IReservationSummary, {} as IReservationSummary,
    {} as IReservationSummary, {} as IReservationSummary];

  cardLayout = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small,
    Breakpoints.Medium
  ]).pipe(
    map((r) => {
      if (r.breakpoints[Breakpoints.Medium]) {
        return {
          columns: 2,
          miniCard: {cols: 1, rows: 1},
          calendar: {cols: 2, rows: 4},
          chart: {cols: 2, rows: 2},
          table: {cols: 2, rows: 4}
        };
      }
      if (r.matches) {
        return {
          columns: 1,
          miniCard: {cols: 1, rows: 1},
          calendar: {cols: 1, rows: 4},
          chart: {cols: 1, rows: 2},
          table: {cols: 1, rows: 3}
        };
      }

      return {
        columns: 4,
        miniCard: {cols: 1, rows: 1},
        calendar: {cols: 4, rows: 4},
        chart: {cols: 2, rows: 2},
        table: {cols: 4, rows: 4}
      };
    })
  );

  private getState: Observable<any>;
  private subscription: Subscription | undefined;
  private isDarkMode: boolean | undefined;

  constructor(private breakpointObserver: BreakpointObserver, private store: Store<AppState>,
              private readonly translate: TranslateService, private router: Router) {
    this.getState = this.store.select(selectReservationState);
    this.store.select(selectAuthState).subscribe((state: any) => {
      const darkMode: boolean = isDarkMode(state.user?.theme);
      if (this.isDarkMode !== undefined && darkMode !== this.isDarkMode) {
        this.createEvents(darkMode);
      }
      this.isDarkMode = darkMode;
    });
    this.annualLabel = this.translate.instant('DASHBOARD.CARD.LABEL.ANNUAL');
    this.customerLabel = this.translate.instant('DASHBOARD.CARD.LABEL.CUSTOMER');
    this.quantityLabel = this.translate.instant('DASHBOARD.CARD.LABEL.QUANTITY');
    this.lastMonthLabel = this.translate.instant('DASHBOARD.CARD.LABEL.LAST_MONTH');
    this.trackingAverage = {
      min: this.translate.instant('DASHBOARD.CARD.LABEL.MIN'),
      avg: this.translate.instant('DASHBOARD.CARD.LABEL.AVG'),
      max: this.translate.instant('DASHBOARD.CARD.LABEL.MAX')
    };
    this.trackingCompare = {
      avg: this.translate.instant('DASHBOARD.CARD.LABEL.AVG'),
      estimate: this.translate.instant('DASHBOARD.CARD.LABEL.ESTIMATE')
    };
    this.viewDate = getNow();
    this.locale = this.translate.currentLang;
    this.totalReservation = 0;
  }

  get total(): number {
    return this.state?.dash?.filter((r: IReservationAll) => isSameMonth(newDate(r.start), this.viewDate)).length;
  }

  private static getSumReservationPrice(total: number, reservation: IReservationAll): number {
    return total + getPrice(reservation.product).total;
  }

  private static createMiniCard(title: string, value: number, isIncrease: boolean, color: ThemePalette, percentValue: number,
                                icon: string, isCurrency: boolean): IReservationSummary {
    return {
      title: `DASHBOARD.MINI_CARD.${title}`,
      value, isIncrease, color, percentValue, icon, isCurrency
    };
  }

  private static createErrorMiniCard(title: string, message: string): IReservationSummary {
    return {
      title: `DASHBOARD.MINI_CARD.${title}`,
      error: {
        status: message
      }
    };
  }

  private static revenue(totalRevenue: number, lastMonthRevenue: number, prevMonthRevenue: number): IReservationSummary {
    return DashComponent.createMiniCard('TOTAL_PRODUCT_SALES', totalRevenue,
      lastMonthRevenue >= prevMonthRevenue, 'primary',
      Math.abs((lastMonthRevenue - prevMonthRevenue) / Math.abs(prevMonthRevenue)), 'payments', true);
  }

  private static products(completedList: IReservationAll[], lastMonthList: IReservationAll[],
                          prevMonthList: IReservationAll[], totalRevenue: number, lastMonthRevenue: number,
                          prevMonthRevenue: number): IReservationSummary {
    const totalAvg = completedList.length ? totalRevenue / completedList.length : 0;
    const lastMonthAvg = lastMonthList.length ? lastMonthRevenue / lastMonthList.length : 0;
    const prevMonthAvg = prevMonthList.length ? prevMonthRevenue / prevMonthList.length : 0;

    return DashComponent.createMiniCard('AVERAGE_PRODUCT_VALUE', Number((totalAvg).toFixed(2)),
      lastMonthAvg >= prevMonthAvg, 'accent',
      Math.abs((lastMonthAvg - prevMonthAvg) / Math.abs(prevMonthAvg)), 'local_atm', true);
  }

  private static totalProducts(completedList: IReservationAll[], lastMonthList: IReservationAll[],
                               prevMonthList: IReservationAll[]): IReservationSummary {
    return DashComponent.createMiniCard('TOTAL_PRODUCTS', completedList.length,
      lastMonthList.length >= prevMonthList.length, 'primary',
      Math.abs((lastMonthList.length - prevMonthList.length) / Math.abs(prevMonthList.length)), 'home_repair_service', false);
  }

  private static customer(completedList: IReservationAll[], lastMonthList: IReservationAll[],
                          prevMonthList: IReservationAll[], filterDate: Date, prevFilterDate: Date): IReservationSummary {

    const totalCustomers = completedList.filter((r: IReservationAll) => newDate(r.start) <= filterDate)
      .reduce((unique: any[], o: IReservationAll) => {
        if (!unique.some(obj => obj.id === o.customer.id)) {
          unique.push(o.customer);
        }
        return unique;
      }, []);

    const totalCustomersPrev = completedList.filter((r: IReservationAll) => newDate(r.start) <= prevFilterDate)
      .reduce((unique: any[], o: IReservationAll) => {
        if (!unique.some(obj => obj.id === o.customer.id)) {
          unique.push(o.customer);
        }
        return unique;
      }, []);

    const lastMonthCustomers = lastMonthList.reduce((unique: any[], o: IReservationAll) => {
      if (!unique.some(obj => obj.id === o.customer.id)) {
        unique.push(o.customer);
      }
      return unique;
    }, []);

    const prevMonthCustomers = prevMonthList.reduce((unique: any[], o: IReservationAll) => {
      if (!unique.some(obj => obj.id === o.customer.id)) {
        unique.push(o.customer);
      }
      return unique;
    }, []);

    let lastMonthCounter = 0;
    lastMonthCustomers.forEach((val: IUserAll) => {
      if (!totalCustomers.some((c: IUserAll) => c.id === val.id)) {
        lastMonthCounter++;
      }
    });

    let prevCounter = 0;
    prevMonthCustomers.forEach((val: IUserAll) => {
      if (!totalCustomersPrev.some((c: IUserAll) => c.id === val.id)) {
        prevCounter++;
      }
    });

    return DashComponent.createMiniCard('NEW_CUSTOMERS_RESERVATION', lastMonthCounter,
      lastMonthCounter >= prevCounter, 'accent', Math.abs((lastMonthCounter - prevCounter) / prevCounter),
      'portrait', false);
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
    this.getReservations();
    this.getTracking();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  handleEvent(event: CalendarEvent): void {
    this.router.navigate(['reservation', event.id]);
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

  private clean(): void {
    this.store.dispatch(
      new fromActionsReservation.Clean()
    );
  }

  private miniCardError(state: any, error: string): void {
    this.state = state;
    this.stateTracking = state;
    const revenue = DashComponent.createErrorMiniCard('TOTAL_PRODUCT_SALES', error);

    const products = DashComponent.createErrorMiniCard('AVERAGE_PRODUCT_VALUE', error);

    const totalProducts = DashComponent.createErrorMiniCard('TOTAL_PRODUCTS', error);

    const customer = DashComponent.createErrorMiniCard('NEW_CUSTOMERS_RESERVATION', error);
    this.miniCardData = [revenue, products, totalProducts, customer];
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.tracking) {
        this.stateTracking = state;
      }
      if (state.errorMessage) {
        this.miniCardError(state, state.errorMessage);
      }
      if (state.dash) {
        this.state = state;
        if (!this.events.length) {
          this.createEvents(this.isDarkMode);
        }
        const filterDate: Date = plusMonth(createDate(), -1);
        const prevFilterDate: Date = plusMonth(createDate(), -2);
        const completedList: IReservationAll[] = this.state.dash?.filter((r: IReservationAll) => r.state === States.completed);
        if (completedList && completedList.length) {
          const lastMonthList: IReservationAll[] = completedList.filter((r: IReservationAll) => newDate(r.start) > filterDate);
          const prevMonthList: IReservationAll[] = completedList.filter(
            (r: IReservationAll) => newDate(r.start) > prevFilterDate && newDate(r.start) < filterDate
          );
          const totalRevenue: number = completedList.reduce(DashComponent.getSumReservationPrice, 0);
          const lastMonthRevenue: number = lastMonthList.reduce(DashComponent.getSumReservationPrice, 0);
          const prevMonthRevenue: number = prevMonthList.reduce(DashComponent.getSumReservationPrice, 0);

          const revenue = DashComponent.revenue(totalRevenue, lastMonthRevenue, prevMonthRevenue);
          const products = DashComponent.products(completedList, lastMonthList, prevMonthList, totalRevenue,
            lastMonthRevenue, prevMonthRevenue);
          const totalProducts = DashComponent.totalProducts(completedList, lastMonthList, prevMonthList);

          const customer = DashComponent.customer(completedList, lastMonthList, prevMonthList, filterDate, prevFilterDate);

          this.miniCardData = [revenue, products, totalProducts, customer];
        } else {
          this.miniCardError(state, 'NO_CONTENT');
          this.isCalendarLoading = false;
        }
      }
    });
  }

  private createEvents(darkMode: boolean = false): void {
    this.events = [];
    this.state.dash?.forEach((it: IReservationAll) => {
      const start = newDate(it.start);
      this.activeDayIsOpen = this.activeDayIsOpen ? this.activeDayIsOpen : isSameDay(start, this.viewDate);
      const duration = convertDuration(it.product.duration);
      const detail = this.translate.instant('RESERVATION.EVENT.CUSTOMER', {
        customerName: getUserName(it.customer)
      });

      const event = monthEvent(detail, start, duration, it.id, findStateColor(it.state, darkMode));
      if (event) {
        this.events = [...this.events, event];
      }
    });
    this.isCalendarLoading = false;
  }

  private getReservations(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAll()
    );
  }

  private getTracking(): void {
    this.store.dispatch(
      new fromActionsReservation.GetTracking()
    );
  }
}
