import { Component, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../../store/app.states';
import { IOverview, IUserAll } from '../../interfaces/user';
import { getUserImage, getUserName, getUserNameInitials } from '../../util/helper';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsUser from '../../store/user.actions';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IPaymentReservation,
  IReservation,
  IReservationOverview,
  IReservationSummary,
  States
} from '../../interfaces/reservation';
import { ThemePalette } from '@angular/material/core';
import { formatDateNameKey, newDate } from '../../util/dates';
import { TranslateService } from '@ngx-translate/core';
import { IChartSummary } from '../../interfaces/dashboard';
import { paymentChart, productChart } from '../../util/chart';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy {
  state: any;
  image: any;
  user: IUserAll | undefined;
  initials: string | undefined;
  username: string | undefined;
  miniCardData: IReservationOverview[] = [{} as IReservationOverview, {} as IReservationOverview];
  measure = 'long';
  paymentChart: IChartSummary | undefined;
  paymentError: any;
  productChart: IChartSummary | undefined;
  productError: any;

  layout = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small,
    Breakpoints.Medium
  ]).pipe(
    map((r) => {
      if (r.breakpoints[Breakpoints.Medium]) {
        return {
          columns: 2,
          miniCard: {cols: 1, rows: 1},
          chart: {cols: 2, rows: 2}
        };
      }
      this.measure = 'short';

      if (r.matches) {
        return {
          columns: 1,
          miniCard: {cols: 1, rows: 1},
          chart: {cols: 1, rows: 2}
        };
      }

      return {
        columns: 4,
        miniCard: {cols: 1, rows: 1},
        chart: {cols: 2, rows: 2}
      };
    })
  );

  private subscription: Subscription | undefined;
  private getState: Observable<any>;

  constructor(private breakpointObserver: BreakpointObserver, private route: ActivatedRoute,
              private store: Store<AppState>, private translate: TranslateService, private router: Router) {
    this.getState = this.store.select(selectUserState);
  }

  private static createMiniCard(title: string, primaryValue: number | string, secondaryValue: number | string,
                                color: ThemePalette, icon: string, split: boolean = false,
                                primary?: IReservation, secondary?: IReservation,
                                link?: (reservation: IReservation | undefined) => void): IReservationOverview {
    return {
      title: `OVERVIEW.MINI_CARD.${title}`, primaryValue, color, icon, secondaryValue, split, primary, secondary, link
    };
  }

  private static createErrorMiniCard(title: string, message: string): IReservationOverview {
    return {
      title: `OVERVIEW.MINI_CARD.${title}`,
      error: {
        status: message
      }
    };
  }

  ngOnInit(): void {
    this.getUserOverview();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state && state.data) {
        this.state = state;
        this.user = this.state.data.customer;
        this.image = getUserImage(this.user);
        this.initials = getUserNameInitials(this.user);
        this.username = getUserName(this.user);
        const completedList = this.state.data.reservations?.filter((r: IPaymentReservation) =>
          r.reservation.state === States.completed || r.reservation.state === States.partiallyCompleted);

        this.miniCardData = [this.getReservationDates(completedList, this.state.data),
          this.getProducts(completedList, this.state.data)];
        if (this.state.data.reservations) {
          this.paymentChart = paymentChart(completedList, this.translate);
          if (!this.paymentChart) {
            this.paymentError = {status: 'NO_CONTENT'};
          }
          this.productChart = productChart(completedList);
          if (!this.productChart) {
            this.productError = {status: 'NO_CONTENT'};
          }
        }
      }
    });
  }

  private getProducts(completedList: undefined | IPaymentReservation[], data: IOverview): IReservationOverview {
    const cancelledList = data.reservations?.filter((r) => r.reservation.state === States.cancelled);
    let card = {} as IReservationSummary;
    if (completedList && completedList.length === 0 && cancelledList && cancelledList.length === 0) {
      card = OverviewComponent.createErrorMiniCard('PRODUCTS', 'NO_CONTENT');
    } else if (completedList || cancelledList) {
      card = OverviewComponent.createMiniCard('PRODUCTS', completedList?.length || 0,
        cancelledList?.length || 0, 'primary', 'home_repair_service');
    }

    return card;
  }

  private getReservationDates(completedList: undefined | IPaymentReservation[], data: IOverview): IReservationOverview {
    let last;
    let next;
    if (completedList && completedList.length) {
      last = completedList.reduce((a, b) => (a.reservation.start > b.reservation.start ? a : b));
    }

    const nextList = data.reservations?.filter((r) =>
      r.reservation.state === States.created || r.reservation.state === States.approved
      || r.reservation.state === States.paid || r.reservation.state === States.partiallyPaid);
    if (nextList && nextList.length) {
      next = nextList.reduce((a, b) => (a.reservation.start > b.reservation.start ? a : b));
    }

    let reservation = {} as IReservationSummary;
    if (completedList && completedList.length === 0 && nextList && nextList.length === 0) {
      reservation = OverviewComponent.createErrorMiniCard('RESERVATIONS', 'NO_CONTENT');
    } else if (last || next) {
      const lastDate = last ?
        formatDateNameKey(newDate(last.reservation.start), this.translate.currentLang, this.measure) : 'N/A';
      const nextDate = next ?
        formatDateNameKey(newDate(next.reservation.start), this.translate.currentLang, this.measure) : 'N/A';
      const primaryValue = this.translate.instant('OVERVIEW.MINI_CARD.UPCOMING', {next: nextDate});
      const secondaryValue = this.translate.instant('OVERVIEW.MINI_CARD.PREVIOUS', {last: lastDate});
      reservation = OverviewComponent.createMiniCard('RESERVATIONS', primaryValue,
        secondaryValue, 'primary', 'today', true, next?.reservation, last?.reservation,
        (r: IReservation | undefined) => !r || this.router.navigate(['reservation', r.id]));
    }

    return reservation;
  }

  private getUserOverview(): void {
    if (!this.user) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsUser.UserOverview(id)
      );
    }
  }
}
