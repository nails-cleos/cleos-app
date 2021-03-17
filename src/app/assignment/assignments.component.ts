import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Pagination } from '../interfaces/pagination';
import { IReservation, IReservationAll, MOBILE_PAGE_SIZE, PAGE_SIZE } from '../interfaces/reservation';
import { Observable, Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../store/app.states';
import { ReservationIconName } from '../reservation/detail/reservation-detail.component';
import { DialogComponent } from '../dialog/dialog.component';
import * as fromActionsReservation from '../store/reservation.actions';

@Component({
  selector: 'app-reservations',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss']
})
export class AssignmentsComponent implements AfterViewInit, OnInit, OnDestroy {
  displayedColumns: string[] = ['position', 'customer', 'start', 'state', 'product', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IReservationAll>>();
  getState: Observable<any>;
  subscription: Subscription | undefined;

  resultsLength = 0;
  pageSize = PAGE_SIZE;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  language: string;
  error: any;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private router: Router,
              private store: Store<AppState>, private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectReservationState);
    this.language = this.translate.currentLang;
  }

  ngOnInit(): void {
    this.subscribe();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.getReservations();
      // this.paginator.pageIndex = 0;
    });

    this.paginator.page.subscribe(() => {
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
      page: this.paginator.pageIndex
    };
    this.store.dispatch(
      new fromActionsReservation.GetAllAssignmentPage(payload)
    );
  }
}

