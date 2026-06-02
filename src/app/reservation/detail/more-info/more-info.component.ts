import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Store } from '@ngrx/store';
import { IPaymentAll } from '../../../interfaces/payment';
import {
  executeTrackingByReservationId,
  getReview,
  getTrackingByReservationId,
  reservationFindPayments,
  updateTrackingByReservationId,
} from '../../../store/actions/reservation.actions';
import { recreate } from '../../../store/actions/payment.actions';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { getDiffTime, newDateTimestamp } from '../../../util/dates';
import { Clipboard } from '@angular/cdk/clipboard';
import { executeDialog } from '../../../util/helper';
import { MatDialog } from '@angular/material/dialog';
import { UpdateTrackingDialogComponent } from './update-tracking-dialog.component';
import { TimeDetailPipe } from '../../../pipes/time-detail.pipe';
import { RatingComponent } from '../../../shared/rating/rating.component';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import { ToastService } from '../../../services/toast.service';
import { ReservationState } from '../../../store/reducers/reservation.reducers';
import { PaymentState } from '../../../store/reducers/payment.reducers';
import {
  getPaymentsPipe,
  getReviewPipe,
  getTrackingPipe,
} from '../../../store/selectors/reservation.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatFooterCell,
  MatFooterCellDef,
  MatFooterRow,
  MatFooterRowDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-more-info',
  templateUrl: './more-info.component.html',
  styleUrls: ['./more-info.component.scss'],
  imports: [TimeDetailPipe, MatIcon, MatIconButton, MatButton, TranslatePipe, DecimalPipe, NgClass,
    DatePipe, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatTooltip,
    MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRow, MatFooterRowDef,
    BackButtonDirective, TimeDetailPipe, RatingComponent, BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoreInfoComponent {
  id = input<string>();

  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly store: Store<ReservationState | PaymentState> = inject(Store<ReservationState | PaymentState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly clipboard: Clipboard = inject(Clipboard);
  private readonly toastService: ToastService = inject(ToastService);

  private payments$ = this.store.pipe(getPaymentsPipe);
  private tracking$ = this.store.pipe(getTrackingPipe);
  private review$ = this.store.pipe(getReviewPipe);

  paymentsSignal = toSignal(this.payments$);
  trackingSignal = toSignal(this.tracking$);
  reviewSignal = toSignal(this.review$);

  displayedColumns: string[] = ['position', 'description', 'amount', 'type', 'status', 'actions'];

  dateFormat: string = this.translate.getCurrentLang();

  totalTime = computed(() => {
    const tracking = this.trackingSignal();
    if (tracking?.startedTimestamp && tracking?.completedTimestamp) {
      return getDiffTime(newDateTimestamp(tracking.completedTimestamp),
        newDateTimestamp(tracking.startedTimestamp));
    }
    return undefined;
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        this.store.dispatch(getTrackingByReservationId({ id }));
        this.store.dispatch(reservationFindPayments({ id }));
        this.store.dispatch(getReview({ id }));
      }
    });
  }

  execute() {
    const id = this.id();
    if (id) {
      this.store.dispatch(executeTrackingByReservationId({ id }));
    }
  }

  update() {
    const id = this.id();
    if (id) {
      const tracking = this.trackingSignal();
      executeDialog(this.dialog, UpdateTrackingDialogComponent, {
        startedTimestamp: tracking?.startedTimestamp,
        completedTimestamp: tracking?.completedTimestamp,
      }, result => {
        if (result) {
          this.store.dispatch(updateTrackingByReservationId(
            { id, started: result.started, completed: result.completed }),
          );
        }
      }, true);
    }
  }

  resend = (payment: IPaymentAll): void => this.store.dispatch(
    recreate({ id: payment.id, paymentType: payment.type }),
  );

  copy = (payment: IPaymentAll): void => {
    if (payment.link) {
      this.clipboard.copy(payment.link);
      this.toastService.show(this.translate.instant('PAYMENT.COPY'), 'info');
    }
  };
}
