import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../../interfaces/pagination';
import { ICustomerReservation, IReservation, IReservationAll } from '../../../interfaces/reservation';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../../store/app.states';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ReservationIconName } from '../../../reservation/detail/reservation-detail.component';
import * as fromActionsReservation from '../../../store/reservation.actions';
import { convertDuration, createNewDate, newDate } from '../../../util/dates';
import { getPriceDiscount, getUserName, priceWithExtras, snakeToCamel, totalPaid, totalPrice } from '../../../util/helper';
import { IPayment } from '../../../interfaces/payment';
import { stampAnimation, transitionAnimation } from '../../../util/animation';

@Component({
  selector: 'app-reservations',
  animations: [transitionAnimation, stampAnimation],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'professional', 'start', 'product', 'state', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IReservationAll>>();
  getState: Observable<any>;
  subscription: Subscription | undefined;
  data: ICustomerReservation | undefined;
  upcoming: any = {};
  payments: IPayment[] | undefined;
  paid = 0;
  total = 0;
  price = 0;
  isPaid = false;
  noContent = false;
  end: Date | undefined;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;

  language: string;
  error: any;

  priceDiscount: number | undefined;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private router: Router,
              private store: Store<AppState>, private breakpointObserver: BreakpointObserver,
              private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectReservationState);
    this.language = this.translate.currentLang;
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.pageSize = MOBILE_PAGE_SIZE;
      }
    });
  }

  get professionalName(): string {
    return this.getProfessionalName(this.upcoming);
  }

  getProfessionalName(reservation: any): string {
    return getUserName(reservation.room.professional);
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

  getIcon(name: any): any {
    // @ts-ignore
    return ReservationIconName[snakeToCamel(name)];
  }

  view(reservation: IReservation): void {
    this.router.navigate(['reservation', reservation.id]);
  }

  edit(reservation: IReservationAll): void {
    this.router.navigate(['me', 'reservation', reservation.id]);
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsReservation.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.error = state.error;
      this.data = state.customerReservation;
      if (this.data) {
        this.noContent = !this.data.upcoming;
        this.dataSource = this.data.reservations?.content;
        this.resultsLength = this.data.reservations?.totalElements;
        this.upcoming = this.data.upcoming ? this.data.upcoming : this.upcoming;
        if (this.upcoming?.id) {
          this.payments = this.data.currentReservationPayments ? this.data.currentReservationPayments : this.payments;
          this.paid = totalPaid(this.payments);
          this.total = totalPrice(this.upcoming.product);
          this.price = priceWithExtras(this.upcoming.product);
          const duration = convertDuration(this.upcoming.product.duration);
          this.end = newDate(this.upcoming.start);
          this.end = createNewDate(this.end, this.end.getHours() + duration.hour, this.end.getMinutes() + duration.minute);
          this.isPaid = this.total === this.paid;
          if (this.upcoming.product.discount && this.upcoming.product.discount.amount) {
            this.priceDiscount = getPriceDiscount(this.upcoming.product.discount, this.upcoming.product.price);
            this.isPaid = this.priceDiscount === this.paid;
          }
        }
      }
    });
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
}
