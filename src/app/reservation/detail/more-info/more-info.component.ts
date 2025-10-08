import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AppState, selectPaymentState, selectReservationState } from '../../../store/app.states';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { IPaymentAll } from '../../../interfaces/payment';
import { ITracking } from '../../../interfaces/reservation';
import * as fromActionsReservation from '../../../store/reservation.actions';
import * as fromActionsPayment from '../../../store/payment.actions';
import { TranslateService } from '@ngx-translate/core';
import { getDiffTime, newDateTimestamp } from '../../../util/dates';
import { Clipboard } from '@angular/cdk/clipboard';
import { executeDialog } from '../../../util/helper';
import { MatDialog } from '@angular/material/dialog';
import { UpdateTrackingDialogComponent } from './update-tracking-dialog.component';
import { SharedModule } from '../../../shared/shared.module';
import { TimeDetailPipe } from '../../../pipes/time-detail.pipe';
import { RatingComponent } from '../../../shared/rating/rating.component';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import { IReview } from '../../../interfaces/review';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-more-info',
  templateUrl: './more-info.component.html',
  styleUrls: ['./more-info.component.scss'],
  imports: [SharedModule, TimeDetailPipe, RatingComponent, BackButtonDirective],
})
export class MoreInfoComponent implements OnInit, OnDestroy {
  private dialog: MatDialog = inject(MatDialog);
  private store: Store<AppState> = inject(Store<AppState>);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private translate: TranslateService = inject(TranslateService);
  private clipboard: Clipboard = inject(Clipboard);
  private toastService: ToastService = inject(ToastService);

  displayedColumns: string[] = ['position', 'description', 'amount', 'type', 'status', 'actions'];

  tracking?: ITracking;
  payments?: IPaymentAll[];
  review?: IReview;

  dateFormat: string = this.translate.currentLang;
  totalTime?: string;

  private paymentGetState: Observable<any> = this.store.select(selectPaymentState);
  private paymentSubscription?: Subscription;
  private reservationId: any;

  private getState: Observable<any> = this.store.select(selectReservationState);
  private subscription?: Subscription;

  get execute(): void {
    this.tracking = undefined;
    return this.store.dispatch(
      new fromActionsReservation.ExecuteTrackingByReservationId(this.reservationId),
    );
  }

  get update(): void {
    return executeDialog(this.dialog, UpdateTrackingDialogComponent, {
      startedTimestamp: this.tracking?.startedTimestamp,
      completedTimestamp: this.tracking?.completedTimestamp,
    }, result => {
      if (result) {
        this.tracking = undefined;
        this.store.dispatch(
          new fromActionsReservation.UpdateTrackingByReservationId(this.reservationId, result.started,
            result.completed),
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
    new fromActionsPayment.Recreate(payment.id, payment.type),
  );

  copy = (payment: IPaymentAll): void => {
    if (payment.link) {
      this.clipboard.copy(payment.link);
      this.toastService.info(this.translate.instant('PAYMENT.COPY'));
    }
  };

  private getInformation = (): void => {
    if (!this.tracking) {
      this.tracking = undefined;
      this.store.dispatch(
        new fromActionsReservation.GetTrackingByReservationId(this.reservationId),
      );
    }
    if (!this.payments) {
      this.payments = undefined;
      this.store.dispatch(
        new fromActionsReservation.ReservationFindPayments(this.reservationId),
      );
    }
    if (!this.review) {
      this.review = undefined;
      this.store.dispatch(
        new fromActionsReservation.GetReview(this.reservationId),
      );
    }
  };

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe((state) => {
      this.payments = state.payments;
      this.tracking = state.tracking;
      this.review = state.review;
      if (this.tracking && this.tracking.startedTimestamp && this.tracking.completedTimestamp) {
        this.totalTime = getDiffTime(newDateTimestamp(this.tracking.completedTimestamp),
          newDateTimestamp(this.tracking.startedTimestamp));
      }
    });
    this.paymentSubscription = this.paymentGetState.subscribe((state) => {
      if (state.response) {
        this.payments = undefined;
        this.getInformation();
      }
    });
  };
}
