import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectReservationState } from '../../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsReservation from '../../../store/reservation.actions';
import { IReservation, IReservationAll } from '../../../interfaces/reservation';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../../interfaces/pagination';
import { DialogComponent } from '../../../shared/dialog/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { openDialog } from '../../../util/helper';
import { isSameTimeZone, newDateTimestamp } from '../../../util/dates';
import { Role } from '../../../interfaces/token';
import { detailExpandAnimation } from '../../../util/animation';

@Component({
  selector: 'app-reservation-table',
  templateUrl: './reservation-table.component.html',
  styleUrls: ['./reservation-table.component.scss'],
  animations: [detailExpandAnimation]
})
export class ReservationTableComponent implements AfterViewInit, OnInit, OnChanges, OnDestroy {
  @Input() roomId: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'customer', 'professional', 'start', 'product', 'state', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IReservationAll>>();
  expanded?: IReservationAll;
  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;
  error: any;
  isAdmin = false;
  locale: string;

  private getState: Observable<any>;
  private subscription?: Subscription;
  private paginatorSubscription?: Subscription;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private store: Store<AppState>,
              private cdRef: ChangeDetectorRef, private breakpointObserver: BreakpointObserver) {
    this.getState = this.store.select(selectReservationState);
    this.locale = this.translate.currentLang;
    this.store.select(selectAuthState).subscribe((state: any) =>
      this.isAdmin = state.user?.authorities.some((u: { authority: Role }) => u.authority === Role.admin));
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
    this.getReservations();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.sort) {
      this.paginator.pageIndex = 0;
      this.getReservations(0);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.paginatorSubscription?.unsubscribe();
  }

  showTimeZone(reservation: IReservationAll): boolean {
    return !isSameTimeZone(reservation.room.timeZone);
  }

  openDialog(reservation: IReservationAll): void {
    const time = newDateTimestamp(reservation.timestamp);
    openDialog(reservation.room, this.locale, this.translate, this.dialog, time);
  }

  delete(reservation: IReservation): void {
    const title = this.translate.instant('RESERVATION.DELETED.TITLE');
    const content = this.translate.instant('RESERVATION.DELETED.CONTENT', {date: newDateTimestamp(reservation.timestamp)});
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
        if (!this.paginatorSubscription && this.resultsLength) {
          this.createPageSubscriptions();
        }
      }
    });
  }

  private getReservations(page: number = 0): void {
    const payload = {
      roomId: this.roomId,
      active: this.sort.active,
      direction: this.sort.direction,
      size: this.pageSize,
      page
    };
    this.store.dispatch(
      new fromActionsReservation.GetAllPage(payload)
    );
  }

  private createPageSubscriptions(): void {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.getReservations();
    });
    this.paginatorSubscription = this.paginator?.page.subscribe(() => this.getReservations(this.paginator.pageIndex));

    this.cdRef.detectChanges();
  }
}
