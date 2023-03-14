import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppState, selectPaymentState, selectReservationState } from '../../../store/app.states';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { IPaymentAll, PaymentType } from '../../../interfaces/payment';
import { IReservationAll, ITracking } from '../../../interfaces/reservation';
import * as fromActionsReservation from '../../../store/reservation.actions';
import * as fromActionsPayment from '../../../store/payment.actions';
import { TranslateService } from '@ngx-translate/core';
import { getDiffTime, newDate, newDateTimestamp } from '../../../util/dates';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from '../../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-more-info',
  templateUrl: './more-info.component.html',
  styleUrls: ['./more-info.component.scss']
})
export class MoreInfoComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['position', 'description', 'amount', 'type', 'status', 'actions'];

  tracking?: ITracking;
  payments?: IPaymentAll[];
  reservation?: IReservationAll;

  language: string;
  totalTime?: string;

  private paymentGetState: Observable<any>;
  private paymentSubscription?: Subscription;
  private reservationId: any;

  private getState: Observable<any>;
  private subscription?: Subscription;

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
      new fromActionsPayment.PaymentRecreate({id: payment.id, paymentType: payment.type})
    );
  }

  copy(payment: IPaymentAll): void {
    let url;
    switch (payment.type) {
      case PaymentType.ml:
        url = `${environment.mlUrl}?pref_id=${payment.preferenceId}`;
        break;
      case PaymentType.paypal:
        url = `${environment.paypalUrl}?token=${payment.preferenceId}`;
        break;
      default:
        return;
    }
    this.clipboard.copy(url);
    this.snackBar.open(this.translate.instant('PAYMENT.COPY'), 'OK', {
      duration: 5000
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.payments = state.payments;
      this.tracking = state.tracking;
      this.reservation = state.selected;
      if (this.tracking && this.tracking.startedTimestamp && this.tracking.completedTimestamp) {
        this.totalTime = getDiffTime(newDateTimestamp(this.tracking.startedTimestamp), newDateTimestamp(this.tracking.completedTimestamp));
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
        new fromActionsReservation.ReservationFind({id: this.reservationId})
      );
    }
  }
}
