import { Component, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../store/app.states';
import * as fromActionsReservation from '../store/reservation.actions';
import { IReservationAll, IReservationSummary } from '../interfaces/reservation';
import { IUserAll } from '../interfaces/user';
import { TranslateService } from '@ngx-translate/core';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.scss']
})
export class DashComponent implements OnInit, OnDestroy {
  getState: Observable<any>;
  subscription: Subscription | undefined;
  state: any;
  annualLabel: any;
  customerLabel: any;
  quantityLabel: any;
  lastMonthLabel: any;

  // @ts-ignore
  miniCardData: IReservationSummary[] = [{}, {}, {}, {}];

  cardLayout = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({matches}) => {
      if (matches) {
        return {
          columns: 1,
          miniCard: {cols: 1, rows: 1},
          chart: {cols: 1, rows: 2},
          table: {cols: 1, rows: 3}
        };
      }

      return {
        columns: 4,
        miniCard: {cols: 1, rows: 1},
        chart: {cols: 2, rows: 2},
        table: {cols: 4, rows: 4}
      };
    })
  );

  constructor(private breakpointObserver: BreakpointObserver, private store: Store<AppState>,
              private readonly translate: TranslateService) {
    this.getState = this.store.select(selectReservationState);
    this.annualLabel = this.translate.instant('DASHBOARD.CARD.LABEL.ANNUAL');
    this.customerLabel = this.translate.instant('DASHBOARD.CARD.LABEL.CUSTOMER');
    this.quantityLabel = this.translate.instant('DASHBOARD.CARD.LABEL.QUANTITY');
    this.lastMonthLabel = this.translate.instant('DASHBOARD.CARD.LABEL.LAST_MONTH');
  }

  private static getSumReservationPrice(total: number, reservation: IReservationAll): number {
    return total + reservation.product.price;
  }

  private static createMiniCard(title: string, value: number, isIncrease: boolean, color: ThemePalette, percentValue: number,
                                icon: string, isCurrency: boolean): IReservationSummary {
    return {
      title: `DASHBOARD.MINI_CARD.${title}`,
      value, isIncrease, color, percentValue, icon, isCurrency
    };
  }

  private static createErrorMiniCard(title: string, error: string): IReservationSummary {
    return {
      title: `DASHBOARD.MINI_CARD.${title}`,
      error
    };
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
    this.getReservations();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsReservation.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.errorMessage) {
        this.state = state;
        const revenue = DashComponent.createErrorMiniCard('TOTAL_PRODUCT_SALES', this.state.errorMessage);

        const products = DashComponent.createErrorMiniCard('AVERAGE_PRODUCT_VALUE', this.state.errorMessage);

        const totalProducts = DashComponent.createErrorMiniCard('TOTAL_PRODUCTS', this.state.errorMessage);

        const customer = DashComponent.createErrorMiniCard('NEW_CUSTOMERS_RESERVATION', this.state.errorMessage);
        this.miniCardData = [revenue, products, totalProducts, customer];
      }
      if (state.data && Array.isArray(state.data) && !state.data[0].reservations) {
        this.state = state;
        const now = new Date(new Date().setHours(0, 0));
        const filterDate = new Date(now.setMonth(now.getMonth() - 1));
        const prevFilterDate = new Date(now.setMonth(now.getMonth() - 1));
        const completedList = this.state.data?.filter((r: IReservationAll) => r.state === 'COMPLETED');
        if (completedList) {
          const lastMonthList = completedList.filter((r: IReservationAll) => new Date(r.start) > filterDate);
          const prevMonthList = completedList.filter(
            (r: IReservationAll) => new Date(r.start) > prevFilterDate && new Date(r.start) < filterDate
          );
          const totalRevenue = completedList.reduce(DashComponent.getSumReservationPrice, 0);
          const lastMonthRevenue = lastMonthList.reduce(DashComponent.getSumReservationPrice, 0);
          const prevMonthRevenue = prevMonthList.reduce(DashComponent.getSumReservationPrice, 0);

          const totalAvg = totalRevenue / completedList.length;
          const lastMonthAvg = lastMonthRevenue / lastMonthList.length;
          const prevMonthAvg = prevMonthRevenue / prevMonthList.length;

          const totalCustomers = completedList.filter((r: IReservationAll) => new Date(r.start) <= filterDate)
            .reduce((unique: any[], o: IReservationAll) => {
              if (!unique.some(obj => obj.id === o.customer.id)) {
                unique.push(o.customer);
              }
              return unique;
            }, []);

          const totalCustomersPrev = completedList.filter((r: IReservationAll) => new Date(r.start) <= prevFilterDate)
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

          const revenue = DashComponent.createMiniCard('TOTAL_PRODUCT_SALES', totalRevenue,
            lastMonthRevenue >= prevMonthRevenue, 'primary',
            Math.abs((lastMonthRevenue - prevMonthRevenue) / Math.abs(prevMonthRevenue)), 'payments', true);

          const products = DashComponent.createMiniCard('AVERAGE_PRODUCT_VALUE', Number((totalAvg).toFixed(2)),
            lastMonthAvg >= prevMonthAvg, 'accent',
            Math.abs((lastMonthAvg - prevMonthAvg) / Math.abs(prevMonthAvg)), 'local_atm', true);

          const totalProducts = DashComponent.createMiniCard('TOTAL_PRODUCTS', completedList.length,
            lastMonthList.length >= prevMonthList.length, 'primary',
            Math.abs((lastMonthList.length - prevMonthList.length) / Math.abs(prevMonthList.length)), 'home_repair_service', false);

          const customer = DashComponent.createMiniCard('NEW_CUSTOMERS_RESERVATION', lastMonthCounter,
            lastMonthCounter >= prevCounter, 'accent',
            Math.abs((lastMonthCounter - prevCounter) / prevCounter), 'portrait', false);

          this.miniCardData = [revenue, products, totalProducts, customer];
        }
      }
    });
  }

  private getReservations(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAll()
    );
  }
}
