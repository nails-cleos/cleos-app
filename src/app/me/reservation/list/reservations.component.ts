import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../../interfaces/pagination';
import { ICustomerReservation, IReservationAll, IUpcomingAll, States } from '../../../interfaces/reservation';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../../store/app.states';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import * as fromActionsReservation from '../../../store/reservation.actions';
import { isSameTimeZone, newDateTimestamp } from '../../../util/dates';
import { executeDialogNoWidth, openDialog } from '../../../util/helper';
import { stampAnimation, transitionAnimation } from '../../../util/animation';
import { IReview, Review } from '../../../interfaces/review';
import { ReviewDialogComponent } from '../review/review-dialog.component';
import { isToday } from 'date-fns';
import { Router } from '@angular/router';
import { IPayment } from '../../../interfaces/payment';
import { Analytics, logEvent } from '@angular/fire/analytics';

@Component({
  selector: 'app-reservations',
  animations: [transitionAnimation, stampAnimation],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'professional', 'timestamp', 'treatment', 'state', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IReservationAll>>();

  upcoming?: IUpcomingAll[];
  noContent = false;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;

  dateFormat: string;
  language: string;
  error: any;
  small = false;

  private data?: ICustomerReservation;
  private showReview = true;
  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private store: Store<AppState>,
              private router: Router, breakpointObserver: BreakpointObserver, private cdRef: ChangeDetectorRef,
              private analytic: Analytics) {
    this.getState = this.store.select(selectReservationState);
    this.dateFormat = this.translate.currentLang;
    this.language = this.translate.currentLang;
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.small = true;
        this.pageSize = MOBILE_PAGE_SIZE;
      }
    });
    logEvent(this.analytic, 'screen_view', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      firebase_screen: 'Main reservation page',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      firebase_screen_class: 'ReservationsComponent'
    });
  }

  showTimeZone(reservation: IReservationAll): boolean {
    return !isSameTimeZone(reservation.room.timeZone);
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.getReservations();
    });

    this.paginator?.page.subscribe(() => this.getReservations(this.paginator.pageIndex));

    this.getReservations();
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onRatingChanged(reservation: IReservationAll): void {
    executeDialogNoWidth(this.dialog, ReviewDialogComponent, reservation, result => {
      if (result && result.rating) {
        const review: IReview = new Review(result.rating);
        review.reservationId = reservation?.id;
        review.detail = result.detail ? result.detail : this.translate.instant(`ME.REVIEW.RATING.${ result.rating }`);
        this.store.dispatch(
          new fromActionsReservation.ReservationReview(review)
        );
      }
    });
  }

  openDialog(reservation: IReservationAll): void {
    const time = newDateTimestamp(reservation.timestamp);
    openDialog(reservation.room, this.dateFormat, this.translate, this.dialog, time);
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsReservation.Clean()
    );
  }

  private getReservations(page: number = 0): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      size: this.pageSize,
      page
    };
    this.store.dispatch(
      new fromActionsReservation.GetCustomerReservations(payload)
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.error = state.error;
      this.data = state.customerReservation;
      if (this.data) {
        this.noContent = !this.data.upcoming || !this.data.upcoming.length;
        if (this.data.reservations) {
          this.data.upcoming.forEach(u => {
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
          this.dataSource = this.data.reservations.content?.map((reservation: IReservationAll) => {
            if (this.showReview && reservation.state === States.completed
              && isToday(newDateTimestamp(reservation.timestamp, reservation.room.timeZone))
              && !reservation.review) {
              this.onRatingChanged(reservation);
              this.showReview = false;
            }
            return reservation;
          });
        }
        this.resultsLength = this.data.reservations?.totalElements;
        if (this.data.upcoming && this.data.upcoming.length) {
          this.upcoming = this.data.upcoming;
        }
      }
    });
  }
}
