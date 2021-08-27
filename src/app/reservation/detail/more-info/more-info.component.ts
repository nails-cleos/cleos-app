import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppState, selectPaymentState, selectReservationState } from '../../../store/app.states';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { IPaymentAll } from '../../../interfaces/payment';
import { IReservationAll, ITracking } from '../../../interfaces/reservation';
import * as fromActionsReservation from '../../../store/reservation.actions';
import * as fromActionsPayment from '../../../store/payment.actions';
import { TranslateService } from '@ngx-translate/core';
import { getDiffTime, newDate } from '../../../util/dates';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from '../../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-more-info',
  templateUrl: './more-info.component.html',
  styleUrls: ['./more-info.component.scss']
})
export class MoreInfoComponent implements OnInit, OnDestroy {
  getState: Observable<any>;
  subscription: Subscription | undefined;
  paymentGetState: Observable<any>;
  paymentSubscription: Subscription | undefined;
  tracking: ITracking | undefined;

  displayedColumns: string[] = ['position', 'description', 'amount', 'status', 'actions'];
  payments: IPaymentAll[] | undefined;
  reservation: IReservationAll | undefined;

  language: string;

  totalTime: string | undefined;
  reservationId: any;

  constructor(private store: Store<AppState>, private route: ActivatedRoute, private translate: TranslateService,
              private clipboard: Clipboard, private snackBar: MatSnackBar) {
    this.getState = this.store.select(selectReservationState);
    this.paymentGetState = this.store.select(selectPaymentState);
    this.language = this.translate.currentLang;
  }

  ngOnInit(): void {
    this.subscribe();
    this.route.params.subscribe(routeParams => {
      this.reservationId = routeParams.id;
      this.getInformation();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.paymentSubscription?.unsubscribe();
  }

  resend(payment: IPaymentAll): void {
    this.store.dispatch(
      new fromActionsPayment.PaymentRecreate(payment.id)
    );
  }

  copy(payment: IPaymentAll): void {
    this.clipboard.copy(`${environment.mlUrl}?pref_id=${payment.preferenceId}`);
    this.snackBar.open(this.translate.instant('PAYMENT.COPY'), 'OK', {
      duration: 5000
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.payments = state.payments;
      this.tracking = state.tracking;
      this.reservation = state.selected;
      if (this.tracking && this.tracking.startedTime && this.tracking.completedTime) {
        this.totalTime = getDiffTime(newDate(this.tracking.startedTime), newDate(this.tracking.completedTime));
      }
    });
    this.paymentSubscription = this.paymentGetState.subscribe(state => {
      if (state.message) {
        this.payments = undefined;
        this.getInformation();
      }
    });
  }

  private getInformation(): void {
    if (!this.tracking) {
      this.tracking = undefined;
      this.store.dispatch(
        new fromActionsReservation.FindTracking({reservationId: this.reservationId})
      );
    }
    if (!this.payments) {
      this.payments = undefined;
      this.store.dispatch(
        new fromActionsReservation.ReservationFindPayments(this.reservationId)
      );
    }
    if (!this.reservation) {
      this.reservation = undefined;
      this.store.dispatch(
        new fromActionsReservation.ReservationFind(this.reservationId)
      );
    }
  }
}
