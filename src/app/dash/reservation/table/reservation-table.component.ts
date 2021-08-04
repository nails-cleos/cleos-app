import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsReservation from '../../../store/reservation.actions';
import { IReservation, IReservationAll } from '../../../interfaces/reservation';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../../interfaces/pagination';
import { ReservationIconName } from '../../../reservation/detail/reservation-detail.component';
import { DialogComponent } from '../../../shared/dialog/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { getUserName, snakeToCamel } from '../../../util/helper';

@Component({
  selector: 'app-reservation-table',
  templateUrl: './reservation-table.component.html',
  styleUrls: ['./reservation-table.component.scss']
})
export class ReservationTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'customer', 'professional', 'start', 'product', 'state', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IReservationAll>>();
  getState: Observable<any>;
  subscription: Subscription | undefined;

  resultsLength = DEFAULT_LENGTH;
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

  getUsername(user: any): string {
    return getUserName(user);
  }

  getIcon(name: any): any {
    // @ts-ignore
    return ReservationIconName[snakeToCamel(name)];
  }

  view(reservation: IReservation): void {
    this.router.navigate(['reservation', reservation.id]);
  }

  delete(reservation: IReservation): void {
    const title = this.translate.instant('RESERVATION.DELETED.TITLE');
    const content = this.translate.instant('RESERVATION.DELETED.CONTENT', {date: reservation.start});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: reservation}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsReservation.DeleteReservation(result.id)
        );
      }
    });
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

  private getReservations(page: number = 0): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      size: this.pageSize,
      page
    };
    this.store.dispatch(
      new fromActionsReservation.GetAllPage(payload)
    );
  }
}
