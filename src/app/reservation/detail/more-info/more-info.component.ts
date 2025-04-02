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
import { getDiffTime, newDateTimestamp } from '../../../util/dates';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { executeDialog } from '../../../util/helper';
import { MatDialog } from '@angular/material/dialog';
import { UpdateTrackingDialogComponent } from './update-tracking-dialog.component';
import { SharedModule } from '../../../shared/shared.module';
import { TimeDetailPipe } from '../../../pipes/time-detail.pipe';
import { RatingComponent } from '../../../shared/rating/rating.component';
import { BackButtonDirective } from '../../../directives/back-button.directive';

@Component({
  selector: 'app-more-info',
  templateUrl: './more-info.component.html',
  styleUrls: ['./more-info.component.scss'],
  imports: [SharedModule, TimeDetailPipe, RatingComponent, BackButtonDirective]
})
export class MoreInfoComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['position', 'description', 'amount', 'type', 'status', 'actions'];

  tracking?: ITracking;
  payments?: IPaymentAll[];
  reservation?: IReservationAll;

  dateFormat: string;
  totalTime?: string;

  private paymentGetState: Observable<any>;
  private paymentSubscription?: Subscription;
  private reservationId: any;

  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(public dialog: MatDialog, private store: Store<AppState>, private route: ActivatedRoute,
              private translate: TranslateService, private clipboard: Clipboard, private snackBar: MatSnackBar) {
    this.getState = this.store.select(selectReservationState);
    this.paymentGetState = this.store.select(selectPaymentState);
    this.dateFormat = this.translate.currentLang;
  }

  get execute(): void {
    this.tracking = undefined;
    return this.store.dispatch(
      new fromActionsReservation.ExecuteTracking({ reservationId: this.reservationId })
    );
  }

  get update(): void {
    return executeDialog(this.dialog, UpdateTrackingDialogComponent, {
      startedTimestamp: this.tracking?.startedTimestamp,
      completedTimestamp: this.tracking?.completedTimestamp
    }, result => {
      if (result) {
        this.tracking = undefined;
        this.store.dispatch(
          new fromActionsReservation.UpdateTracking({
            reservationId: this.reservationId,
            started: result.started,
            completed: result.completed
          })
        );
      }
    }, true);
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

  resend = (payment: IPaymentAll): void => this.store.dispatch(
    new fromActionsPayment.PaymentRecreate({ id: payment.id, paymentType: payment.type })
  );

  copy = (payment: IPaymentAll): void => {
    if (payment.link) {
      this.clipboard.copy(payment.link);
      this.snackBar.open(this.translate.instant('PAYMENT.COPY'), 'OK', {
        duration: 5000
      });
    }
  };

  private getInformation = (): void => {
    if (!this.tracking) {
      this.tracking = undefined;
      this.store.dispatch(
        new fromActionsReservation.FindTracking({ reservationId: this.reservationId })
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
        new fromActionsReservation.ReservationFind({ id: this.reservationId })
      );
    }
  };

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      this.payments = state.payments;
      this.tracking = state.tracking;
      this.reservation = state.selected;
      if (this.tracking && this.tracking.startedTimestamp && this.tracking.completedTimestamp) {
        this.totalTime = getDiffTime(newDateTimestamp(this.tracking.completedTimestamp),
          newDateTimestamp(this.tracking.startedTimestamp));
      }
    });
    this.paymentSubscription = this.paymentGetState.subscribe(state => {
      if (state.message) {
        this.payments = undefined;
        this.getInformation();
      }
    });
  };
}
