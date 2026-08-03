import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { IPaymentAll } from '../../../interfaces/payment';
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
import { TableSkeletonColumn, TableSkeletonComponent } from '../../../shared/skeleton/table-skeleton.component';
import { NavigationService } from '../../../services/navigation.service';
import { PaymentStore } from '../../../store/payment.store';
import { TrackingStore } from '../../../store/tracking.store';
import { ReservationStore } from '../../../store/reservation.store';

@Component({
  selector: 'app-more-info',
  templateUrl: './more-info.component.html',
  styleUrls: ['./more-info.component.scss'],
  imports: [TimeDetailPipe, MatIcon, MatIconButton, MatButton, TranslatePipe, DecimalPipe, NgClass,
    DatePipe, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatTooltip,
    MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRow, MatFooterRowDef,
    BackButtonDirective, TimeDetailPipe, RatingComponent, BackButtonDirective, TableSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoreInfoComponent {
  id = input<string>();

  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly reservationStore = inject(ReservationStore);
  private readonly paymentStore = inject(PaymentStore);
  private readonly trackingStore = inject(TrackingStore);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly clipboard: Clipboard = inject(Clipboard);
  private readonly toastService: ToastService = inject(ToastService);

  private readonly paymentResource = this.paymentStore.data;
  trackingSignal = this.trackingStore.selected;
  reviewSignal = this.reservationStore.review;
  paymentsLoading = this.paymentStore.isLoading;

  tableColumns: TableSkeletonColumn[] = [
    { key: 'position' },
    { key: 'description' },
    { key: 'amount' },
    { key: 'type', hideOnMobile: true },
    { key: 'status', hideOnMobile: true },
    { key: 'actions' },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);

  readonly language: string = this.navigationService.language;

  readonly paymentList = computed(() => this.paymentResource()?.payments);

  readonly totalTime = computed(() => {
    const tracking = this.trackingSignal();
    if (tracking?.startedTimestamp && tracking?.completedTimestamp) {
      return getDiffTime(newDateTimestamp(tracking.completedTimestamp),
        newDateTimestamp(tracking.startedTimestamp));
    }
    return undefined;
  });

  constructor() {
    this.reservationStore.clean();
    effect(() => {
      const id = this.id();
      if (id) {
        this.trackingStore.getByReservationId(id);
        this.paymentStore.getPaymentByResourceId(id, 'reservation');
        this.reservationStore.loadReview(id);
      }
    });
  }

  execute() {
    const id = this.id();
    if (id) {
      this.trackingStore.executeByReservationId(id);
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
          this.trackingStore.updateByReservationId(id, result.started, result.completed);
        }
      }, true);
    }
  }

  resend = (payment: IPaymentAll): void => this.paymentStore.recreate(payment.id, payment.type);

  copy = (payment: IPaymentAll): void => {
    if (payment.link) {
      this.clipboard.copy(payment.link);
      this.toastService.show(this.translateService.instant('PAYMENT.COPY'), 'info');
    }
  };
}
