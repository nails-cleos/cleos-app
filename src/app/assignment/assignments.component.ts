import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, Pagination } from '../interfaces/pagination';
import { IReservation, IReservationAll, PAGE_SIZE } from '../interfaces/reservation';
import { Observable, Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../store/app.states';
import { ReservationIconName } from '../reservation/detail/reservation-detail.component';
import * as fromActionsReservation from '../store/reservation.actions';
import * as fromActionsProduct from '../store/product.actions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { newDate, getNow } from '../util/dates';

@Component({
  selector: 'app-reservations',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss']
})
export class AssignmentsComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'customer', 'start', 'state', 'product', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IReservationAll>>();
  getState: Observable<any>;
  subscription: Subscription | undefined;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;

  language: string;
  error: any;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private router: Router,
              private store: Store<AppState>, private snackBar: MatSnackBar, private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectReservationState);
    this.language = this.translate.currentLang;
  }

  ngOnInit(): void {
    this.subscribe();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.getReservations();
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

  cancel(reservationId: string): void {
    this.store.dispatch(
      new fromActionsReservation.Cancel(reservationId)
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.error = state.error;
      if (state.page) {
        const now = getNow();
        this.dataSource = state.page?.content?.map((reservation: IReservationAll) => {
          if (reservation.start) {
            const deadLine = newDate(reservation.start) < now;
            return Object.assign({}, reservation, {deadLine});
          }
          return reservation;
        });
        this.resultsLength = state.page?.totalElements;
      }
      if (state.errorMessage || state.message) {
        const snackBarRef = this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });

        if (state.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.clean();
            this.getReservations();
          });
        } else {
          this.error = state.error;
          return;
        }
      }
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsProduct.Clean()
    );
  }

  private getReservations(): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      page: this.paginator ? this.paginator.pageIndex : 0
    };
    this.store.dispatch(
      new fromActionsReservation.GetAllAssignmentPage(payload)
    );
  }
}

