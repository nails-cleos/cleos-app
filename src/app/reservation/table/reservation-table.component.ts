import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsReservation from '../../store/reservation.actions';
import { IReservationAll, PAGE_SIZE } from '../../interfaces/reservation';
import { MatTableDataSource } from '@angular/material/table';
import { Pagination } from '../../interfaces/pagination';
import { ReservationIconName } from '../detail/reservation-detail.component';

@Component({
  selector: 'app-reservation-table',
  templateUrl: './reservation-table.component.html',
  styleUrls: ['./reservation-table.component.scss']
})
export class ReservationTableComponent implements AfterViewInit, OnInit, OnDestroy {
  displayedColumns: string[] = ['position', 'customer', 'start', 'state', 'professional', 'product'];
  dataSource: any = new MatTableDataSource<Pagination<IReservationAll>>();
  getState: Observable<any>;
  subscription: Subscription | undefined;

  resultsLength = 0;
  pageSize = PAGE_SIZE;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  language: string;

  constructor(private store: Store<AppState>, private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectReservationState);
    this.language = navigator.language;
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

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
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
      new fromActionsReservation.GetAllPage(payload)
    );
  }
}
