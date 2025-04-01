import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectRoomState } from '../../../store/app.states';
import * as fromActionsRoom from '../../../store/room.actions';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SharedModule } from '../../../shared/shared.module';
import { IRoomCustomer } from '../../../interfaces/room';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { detailExpandAnimation } from '../../../util/animation';
import { TranslateService } from '@ngx-translate/core';
import { MatSort } from '@angular/material/sort';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../interfaces/pagination';
import { TimeDetailPipe } from '../../../pipes/time-detail.pipe';

@Component({
    selector: 'app-customers',
    animations: [detailExpandAnimation],
    templateUrl: './customers.component.html',
    styleUrl: './customers.component.scss',
    imports: [SharedModule, TimeDetailPipe]
})
export class CustomersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'customer', 'days', 'lastTime', 'actions'];
  customers?: IRoomCustomer[];
  dataSource: MatTableDataSource<IRoomCustomer> = new MatTableDataSource<IRoomCustomer>();
  expanded?: IRoomCustomer;
  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;
  language: string;

  private roomId?: string;
  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(breakpointObserver: BreakpointObserver, private route: ActivatedRoute, private store: Store<AppState>,
              private translate: TranslateService) {
    this.getState = this.store.select(selectRoomState);
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => this.pageSize = result.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);
    this.language = this.translate.currentLang;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.subscribe();
  }

  ngAfterViewInit(): void {
    this.getCustomers();
  }

  private getCustomers = (): void => {
    this.route.params.subscribe((routeParams) => {
      this.roomId = routeParams.id;
      this.store.dispatch(
        new fromActionsRoom.GetCustomerInfo({ id: this.roomId })
      );
    });
  }

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      this.customers = state.customers;
      if (this.customers) {
        this.dataSource.data = this.customers
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }
}
