import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Pagination } from '../../interfaces/pagination';
import { IReservation, IReservationAll, MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/reservation';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../store/app.states';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ReservationIconName } from '../detail/reservation-detail.component';
import * as fromActionsReservation from '../../store/reservation.actions';

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

  resultsLength = 0;
  pageSize = PAGE_SIZE;

  language: string;
  error: any;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private router: Router,
              private store: Store<AppState>, private cdRef: ChangeDetectorRef, private breakpointObserver: BreakpointObserver) {
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
    this.router.navigate(['me', 'reservation', reservation.id]);
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.error = state.error;
      if (state.page) {
        this.dataSource = state.page?.content;
        this.resultsLength = state.page?.totalElements;
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
      new fromActionsReservation.GetAllMePage(payload)
    );
  }
}
