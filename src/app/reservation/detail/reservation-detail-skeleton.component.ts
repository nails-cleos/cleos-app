import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  TableSkeletonColumn,
  TableSkeletonComponent,
} from '@app/shared/skeleton/table-skeleton.component';

@Component({
  selector: 'app-reservation-detail-skeleton',
  templateUrl: './reservation-detail-skeleton.component.html',
  styleUrl: './reservation-detail-skeleton.component.scss',
  imports: [TableSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationDetailSkeletonComponent {
  showTopline = input(true);
  showGhostChip = input(true);
  showFab = input(true);
  showHeroSummary = input(true);
  showNoteSection = input(true);
  showAppointmentSection = input(true);
  showTreatmentSection = input(true);
  showExtras = input(true);
  showPaymentSection = input(true);
  showPaymentAction = input(true);
  showHistorySection = input(true);
  paymentTableRows = input(3);
  historyTableRows = input(3);
  footerButtonCount = input(1);

  paymentTableColumns: TableSkeletonColumn[] = [
    { key: 'position' },
    { key: 'description' },
    { key: 'status', hideOnMobile: true },
    { key: 'type', hideOnMobile: true },
    { key: 'amount' },
  ];

  historyTableColumns: TableSkeletonColumn[] = [
    { key: 'position', hideOnMobile: true },
    { key: 'professional', hideOnMobile: true },
    { key: 'start' },
    { key: 'treatment' },
    { key: 'state', hideOnMobile: true },
  ];

  summaryCards = Array.from({ length: 4 }, (_, index) => index);
  appointmentCards = Array.from({ length: 3 }, (_, index) => index);
  treatmentCards = Array.from({ length: 3 }, (_, index) => index);
  noteCards = Array.from({ length: 2 }, (_, index) => index);
  metaChips = Array.from({ length: 3 }, (_, index) => index);
  extraRows = Array.from({ length: 2 }, (_, index) => index);
  footerButtons = (): number[] =>
    Array.from({ length: this.footerButtonCount() }, (_, index) => index);
}
