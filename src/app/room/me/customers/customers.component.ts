import { AfterViewInit, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectRoomState } from '../../../store/app.states';
import { getAllCustomersInfo } from '../../../store/room.actions';
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
  imports: [SharedModule, TimeDetailPipe],
})
export class CustomersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'customer', 'days', 'lastTime', 'actions'];
  customers?: IRoomCustomer[];
  dataSource = new MatTableDataSource<IRoomCustomer>();
  expanded?: IRoomCustomer;
  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;
  language!: string;

  private readonly store = inject(Store<AppState>);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  private getState: Observable<any> = this.store.select(selectRoomState);
  private roomId?: string;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.pageSize = result.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE;
      });

    this.language = this.translate.currentLang;

    this.subscribeToState();
  }

  ngAfterViewInit(): void {
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCustomers(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.roomId = params['id'];
      if (this.roomId) {
        this.store.dispatch(getAllCustomersInfo({ id: this.roomId }));
      }
    });
  }

  private subscribeToState(): void {
    this.getState.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      this.customers = state.customers;
      if (this.customers) {
        this.dataSource.data = this.customers;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }
}
