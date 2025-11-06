import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { DiscountType, IDiscount } from '../../interfaces/discount';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState, selectDiscountState } from '../../store/app.states';
import {
  clean,
  deleteDiscount,
  discountSelected,
  getDiscountsPage,
  sendDiscountToCustomers,
} from '../../store/discount.actions';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { executeDialog } from '../../util/helper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { detailExpandAnimation } from '../../util/animation';
import { SharedModule } from '../../shared/shared.module';
import { DiscountDialogComponent } from './discount-dialog.component';

@Component({
  selector: 'app-discounts',
  templateUrl: './discounts.component.html',
  styleUrls: ['./discounts.component.scss'],
  animations: [detailExpandAnimation],
  imports: [SharedModule],
})
export class DiscountsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'name', 'description', 'type', 'amount', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IDiscount>>();
  expanded?: IDiscount;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;
  language: string;

  private subscription?: Subscription;
  private paginatorSubscription?: Subscription;
  private getState: Observable<any>;
  private lastSort?: Sort;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private store: Store<AppState>,
              private cdRef: ChangeDetectorRef, breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
    ]).subscribe(result => {
      if (result.matches) {
        this.pageSize = MOBILE_PAGE_SIZE;
      }
    });
    this.getState = this.store.select(selectDiscountState);
    this.language = this.translate.currentLang;
  }

  ngAfterViewInit(): void {
    this.getDiscounts();
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.paginatorSubscription?.unsubscribe();
  }

  edit = (selected: IDiscount): void => this.store.dispatch(discountSelected({ selected }));

  delete = (discount: IDiscount): void => {
    const title = this.translate.instant('DISCOUNT.DELETED.TITLE');
    const content = this.translate.instant('DISCOUNT.DELETED.CONTENT', { name: discount.name });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: discount },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(deleteDiscount({ id: result.id, name: result.name }));
      }
    });
  };

  sentToUsers = (discount: IDiscount): void => {
    const data = {
      discount,
    };
    executeDialog(this.dialog, DiscountDialogComponent, data, result => {
      if (result) {
        this.store.dispatch(
          sendDiscountToCustomers({ id: result.discountId, customersDiscount: result.customerIds }),
        );
      }
    }, true);
  };

  private createPageSubscriptions = (): void => {
    this.sort.sortChange.subscribe((a) => {
      if (a !== this.lastSort) {
        this.paginator.pageIndex = 0;
        this.getDiscounts();
      }
      this.lastSort = a;
    });
    this.paginatorSubscription = this.paginator?.page.subscribe(() => this.getDiscounts(this.paginator.pageIndex));

    this.cdRef.detectChanges();
  };

  private clean = (): void => this.store.dispatch(clean());

  private getDiscounts = (page: number = 0): void => this.store.dispatch(
    getDiscountsPage({
      page: page,
      sort: this.sort.active,
      direction: this.sort.direction,
      size: this.pageSize,
    }),
  );

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe((state) => {
      if (state.response) {
        this.clean();
        this.getDiscounts();
      }
      this.dataSource = state.data?.content?.map((it: IDiscount) => {
        let icon = '';
        switch (it.type) {
          case DiscountType.money:
            icon = it.currency?.icon ?? 'euro';
            break;
          case DiscountType.percentage:
            icon = 'percent';
        }
        return Object.assign({}, it, { icon });
      });
      this.resultsLength = state.data?.totalElements;
      if (!this.paginatorSubscription && this.resultsLength) {
        this.createPageSubscriptions();
      }
    });
  };
}
