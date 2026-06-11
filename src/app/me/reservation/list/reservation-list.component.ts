import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../interfaces/pagination';
import { IReservationAll, States } from '../../../reservation/reservation';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { createReview, getCustomerReservations } from '../../../store/actions/reservation.actions';
import { isSameTimeZone, newDateTimestamp } from '../../../util/dates';
import { executeDialogNoWidth, openDialog } from '../../../util/helper';
import { IReview, Review } from './review';
import { ReviewDialogComponent } from '../review/review-dialog.component';
import { isToday } from 'date-fns';
import { Router, RouterLink } from '@angular/router';
import { IPayment } from '../../../interfaces/payment';
import { UpcomingComponent } from '../upcoming/upcoming.component';
import { TimeDetailPipe } from '../../../pipes/time-detail.pipe';
import { ReservationIconPipe } from '../../../pipes/reservation-icon.pipe';
import { ErrorComponent } from '../../../shared/error/error.component';
import { TableSkeletonColumn, TableSkeletonComponent } from '../../../shared/skeleton/table-skeleton.component';
import {
  getCustomerReservationPipe,
  getReservationErrorPipe,
  getReservationResponsePipe,
  selectReservationIsLoading,
} from '../../../store/selectors/reservation.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReservationState } from '../../../store/reducers/reservation.reducers';
import { FirebaseService } from '../../../services/firebase.service';
import { DiscountStore } from '../../../store/discount.store';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
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
import { MatPrefix } from '@angular/material/input';
import { DatePipe } from '@angular/common';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { UpcomingSkeletonComponent } from '../../../shared/skeleton/upcoming-skeleton.component';

@Component({
  selector: 'app-reservation-list',
  templateUrl: './reservation-list.component.html',
  styleUrls: ['./reservation-list.component.scss'],
  imports: [TimeDetailPipe, MatIcon, MatIconButton, MatButton, TranslatePipe, RouterLink, DatePipe,
    MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatSortHeader, MatTooltip,
    MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRow, MatFooterRowDef,
    MatPaginator, MatPrefix, UpcomingComponent, TimeDetailPipe, ReservationIconPipe, ErrorComponent,
    TableSkeletonComponent, MatTabGroup, MatTab, UpcomingSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationListComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<ReservationState> = inject(Store<ReservationState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly router: Router = inject(Router);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly firebaseService = inject(FirebaseService);
  private readonly discountStore = inject(DiscountStore);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private customerReservation$ = this.store.pipe(getCustomerReservationPipe);
  private response$ = this.store.pipe(getReservationResponsePipe);
  private error$ = this.store.pipe(getReservationErrorPipe);
  private isLoading$ = this.store.select(selectReservationIsLoading);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'timestamp', 'desc');

  private customerReservationSignal = toSignal(this.customerReservation$);
  private responseSignal = toSignal(this.response$);
  private isLoadingSignal = toSignal(this.isLoading$, { initialValue: false });
  private breakpointsSignal = toSignal(
    this.breakpointObserver$, {
      initialValue: {
        matches: false,
        breakpoints: {
          [Breakpoints.XSmall]: false,
          [Breakpoints.Small]: false,
        },
      },
    },
  );

  noContent = signal(true);
  paginatorPageIndex = this.tableState.pageIndex;
  readonly tableColumns: TableSkeletonColumn[] = [
    { key: 'position', hideOnMobile: true },
    { key: 'professional', hideOnMobile: true },
    { key: 'timestamp' },
    { key: 'treatment', hideOnMobile: true },
    { key: 'state' },
    { key: 'actions' },
  ];

  errorSignal = toSignal(this.error$);
  isLoading = computed(() => this.isLoadingSignal());
  reservationSignal = computed(() => this.customerReservationSignal()?.reservations);
  upcomingSignal = computed(() => this.customerReservationSignal()?.upcoming);
  dataSourceSignal = computed(() => this.reservationSignal()?.content?.map((reservation: IReservationAll) => {
    if (this.showReview && reservation.state === States.completed
      && isToday(newDateTimestamp(reservation.timestamp, reservation.room.timeZone))
      && !reservation.review) {
      this.onRatingChanged(reservation);
      this.showReview = false;
    }
    return reservation;
  }));
  resultsLengthSignal = computed(() => this.reservationSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);
  small = computed(() => this.breakpointsSignal()?.matches);

  displayedColumns: string[] = this.tableColumns.map((column) => column.key);

  dateFormat: string = this.translate.getCurrentLang();
  language: string = this.translate.getCurrentLang();

  private showReview = true;

  constructor() {
    effect(() => {
      const request = this.tableState.baseRequest();
      this.store.dispatch(
        getCustomerReservations({
          ...request,
          size: this.pageSizeSignal(),
        }),
      );
    });
    this.tableState.resetOn(this.responseSignal, () => this.discountStore.clean());

    effect(() => {
      if (this.isLoading()) {
        return;
      }
      const upcoming = this.upcomingSignal();
      this.noContent.set(!upcoming || !upcoming.length);
      upcoming?.forEach(u => {
        if (u.state === States.cancelledPaymentRequired) {
          let link = null;
          let paymentId = null;
          let pending = false;
          u.payments.forEach((payment: IPayment) => {
            if (payment.link && payment.status === 'CREATED') {
              link = payment.link;
              return;
            } else if (payment.status === 'CREATED' && !payment.type) {
              paymentId = payment.id;
              return;
            } else if (payment.status === 'PENDING') {
              pending = true;
              return;
            }
          });
          if (link) {
            window.open(link, '_self');
          } else if (paymentId) {
            this.router.navigate([this.language, 'me', 'payment', paymentId]);
          } else if (!pending) {
            this.router.navigate(['/', this.language, 'me', 'reservation', u.id, 'payment', 'option']);
          }
        }
      });
    });

    this.firebaseService.logEvent('screen_view', {
      // eslint-disable-next-line camelcase
      firebase_screen: 'Main reservation page',
      // eslint-disable-next-line camelcase
      firebase_screen_class: 'ReservationsComponent',
    });
  }

  showTimeZone = (reservation: IReservationAll): boolean => !isSameTimeZone(reservation.room.timeZone);

  onRatingChanged = (reservation: IReservationAll): void => executeDialogNoWidth(
    this.dialog, ReviewDialogComponent, reservation, result => {
      if (result && result.rating) {
        const review: IReview = new Review(result.rating);
        review.reservationId = reservation?.id;
        review.detail = result.detail ? result.detail :
          this.translate.instant(`ME.REVIEW.RATING.${ result.rating }`);
        this.store.dispatch(createReview({ review }));
      }
    },
  );

  openDialog = (reservation: IReservationAll): void => {
    const time = newDateTimestamp(reservation.timestamp);
    openDialog(reservation.room, this.dateFormat, this.translate, this.dialog, time);
  };
}
