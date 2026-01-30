import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../interfaces/pagination';
import { IReservationAll, States } from '../../../interfaces/reservation';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { createReview, getCustomerReservations } from '../../../store/reservation.actions';
import { isSameTimeZone, newDateTimestamp } from '../../../util/dates';
import { executeDialogNoWidth, openDialog } from '../../../util/helper';
import { stampAnimation, transitionAnimation } from '../../../util/animation';
import { IReview, Review } from '../../../interfaces/review';
import { ReviewDialogComponent } from '../review/review-dialog.component';
import { isToday } from 'date-fns';
import { Router } from '@angular/router';
import { IPayment } from '../../../interfaces/payment';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { SharedModule } from '../../../shared/shared.module';
import { UpcomingComponent } from '../upcoming/upcoming.component';
import { TimeDetailPipe } from '../../../pipes/time-detail.pipe';
import { ReservationIconPipe } from '../../../pipes/reservation-icon.pipe';
import { ErrorComponent } from '../../../shared/error/error.component';
import {
  getCustomerReservationPipe,
  getReservationErrorPipe,
  getReservationResponsePipe,
} from '../../../store/selectors/reservation.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { cleanDiscount } from '../../../store/discount.actions';
import { ReservationState } from '../../../store/reducers/reservation.reducers';

@Component({
  selector: 'app-reservations',
  animations: [transitionAnimation, stampAnimation],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss'],
  imports: [SharedModule, UpcomingComponent, TimeDetailPipe, ReservationIconPipe, ErrorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationsComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<ReservationState> = inject(Store<ReservationState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly router: Router = inject(Router);
  private readonly analytics: Analytics = inject(Analytics);
  private readonly dialog: MatDialog = inject(MatDialog);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private customerReservation$ = this.store.pipe(getCustomerReservationPipe);
  private response$ = this.store.pipe(getReservationResponsePipe);
  private error$ = this.store.pipe(getReservationErrorPipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

  private customerReservationSignal = toSignal(this.customerReservation$);
  private responseSignal = toSignal(this.response$);
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

  private sortActive = computed(() => this.sort()?.active ?? 'timestamp');
  private sortDirection = computed(() => this.sort()?.direction ?? 'desc');

  noContent = signal(true);
  paginatorPageIndex = signal(0);

  errorSignal = toSignal(this.error$);
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

  displayedColumns: string[] = ['position', 'professional', 'timestamp', 'treatment', 'state', 'actions'];

  dateFormat: string = this.translate.getCurrentLang();
  language: string = this.translate.getCurrentLang();

  private showReview = true;

  constructor() {
    effect((onCleanup) => {
      const paginator = this.paginator();
      if (paginator) {
        const sub = paginator.page.subscribe((pageEvent) => {
          this.paginatorPageIndex.set(pageEvent.pageIndex);
        });
        onCleanup(() => sub.unsubscribe());
      }
    });

    effect(() => {
      const page = this.paginatorPageIndex();
      this.store.dispatch(
        getCustomerReservations({
          page: page,
          sort: this.sortActive(),
          direction: this.sortDirection(),
          size: this.pageSizeSignal(),
        }),
      );
    });

    effect(() => {
      if (this.responseSignal()) {
        this.store.dispatch(cleanDiscount());
        this.paginator()?.firstPage();
      }
    });

    effect(() => {
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

    logEvent(this.analytics, 'screen_view', {
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
          this.translate.instant(`ME.REVIEW.RATING.${result.rating}`);
        this.store.dispatch(createReview({ review }));
      }
    },
  );

  openDialog = (reservation: IReservationAll): void => {
    const time = newDateTimestamp(reservation.timestamp);
    openDialog(reservation.room, this.dateFormat, this.translate, this.dialog, time);
  };
}
