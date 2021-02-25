import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsReservation from '../../store/reservation.actions';
import { IReservation, IReservationAll } from '../../interfaces/reservation';
import { ActivatedRoute } from '@angular/router';
import { ConvertDuration, Duration, IDuration } from '../../util/dates';
import { MatTableDataSource } from '@angular/material/table';
import { Pagination } from '../../interfaces/pagination';
import { IProduct } from '../../interfaces/product';
import { MatPaginator } from '@angular/material/paginator';

export enum ReservationIconName {
  CREATED = 'assignment',
  APPROVED = 'done',
  STARTED = 'play_arrow',
  COMPLETED = 'done_all',
  CANCELLED = 'clear'
}

@Component({
  selector: 'app-reservation-detail',
  templateUrl: './reservation-detail.component.html',
  styleUrls: ['./reservation-detail.component.scss']
})
export class ReservationDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  getState: Observable<any>;
  subscription: Subscription | undefined;
  reservation: IReservationAll | undefined;
  duration: IDuration = new Duration();
  start: Date = new Date();
  end: Date = new Date();
  state: string | undefined;

  locale: string;
  language: string;
  isLoading = false;

  displayedColumns: string[] = ['position', 'professional', 'start', 'product', 'state'];
  dataSource: any;
  pageSize = 5;

  public paginator: MatPaginator | undefined;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private snackBar: MatSnackBar,
              private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectReservationState);
    const userLang = navigator.language;
    const index = userLang.indexOf('-');
    this.language = userLang;
    this.locale = index === -1 ? userLang : userLang.substr(0, index);
  }

  ngOnInit(): void {
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.getReservation();
  }

  getIcon(name: any): any {
    // @ts-ignore
    return ReservationIconName[name];
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
    }
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.isLoading = state.isLoading;
      if (state.selected) {
        this.duration = ConvertDuration(state.selected.product.duration);
        this.start = new Date(state.selected.start);
        this.end = new Date(new Date(state.selected.start).setHours(this.start.getHours() + this.duration.hour,
          this.start.getMinutes() + this.duration.minute));
        // @ts-ignore
        this.state = ReservationIconName[state.selected.state];
        this.reservation = state.selected;
        this.dataSource = new MatTableDataSource<IReservationAll>(state.selected.history);
        this.cdRef.detectChanges();
      }
      if (state.errorMessage) {
        this.snackBar.open(state.errorMessage, 'OK', {
          duration: 5000
        });
      }
    });
  }

  private getReservation(): void {
    if (!this.reservation) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsReservation.ReservationFind(id)
      );
    }
  }
}
