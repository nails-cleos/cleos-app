import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, Pagination } from '../../interfaces/pagination';
import {
  ICustomerReservation,
  IReservation,
  IReservationAll,
  MOBILE_PAGE_SIZE,
  PAGE_SIZE
} from '../../interfaces/reservation';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../store/app.states';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ReservationIconName } from '../detail/reservation-detail.component';
import * as fromActionsReservation from '../../store/reservation.actions';
import { convertDuration, createNewDate, newDate } from '../../util/dates';

@Component({
  selector: 'app-reservations',
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
  upcoming: any;
  noContent = false;
  end: Date | undefined;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;

  language: string;
  error: any;

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

  ngOnInit(): void {
    this.clean();
    this.subscribe();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.getReservations();
      // this.paginator.pageIndex = 0;
    });

    this.paginator?.page.subscribe(() => {
      this.getReservations();
    });

    this.getReservations();
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getIcon(name: any): any {
    // @ts-ignore
    return ReservationIconName[name];
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
        this.noContent = !state.isLoading && !this.data.upcoming;
        this.dataSource = this.data.reservations?.content;
        this.resultsLength = this.data.reservations?.totalElements;
        this.upcoming = this.data.upcoming ? this.data.upcoming : this.upcoming;
        if (this.upcoming) {
          const duration = convertDuration(this.upcoming.product.duration);
          this.end = newDate(this.upcoming.start);
          this.end = createNewDate(this.end, this.end.getHours() + duration.hour, this.end.getMinutes() + duration.minute);
        }
      }
    });
  }

  private getReservations(): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      page: this.paginator ? this.paginator.pageIndex : 0,
      size: this.pageSize
    };
    this.store.dispatch(
      new fromActionsReservation.GetCustomerReservations(payload)
    );
  }
}
