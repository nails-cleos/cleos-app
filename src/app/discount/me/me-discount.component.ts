import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, Pagination } from '../../interfaces/pagination';
import { DiscountType, IUserDiscount, PAGE_SIZE } from '../../interfaces/discount';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectDiscountState } from '../../store/app.states';
import * as fromActionsDiscount from '../../store/discount.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-me-discount',
  templateUrl: './me-discount.component.html',
  styleUrls: ['./me-discount.component.scss']
})
export class MeDiscountComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'name', 'amount', 'used', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IUserDiscount>>();
  subscription: Subscription | undefined;
  getState: Observable<any>;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;
  error: any;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private snackBar: MatSnackBar,
              private store: Store<AppState>, private router: Router, private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectDiscountState);
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.getDiscounts();
    });

    this.paginator?.page.subscribe(() => {
      this.getDiscounts();
    });

    this.getDiscounts();
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.subscribe();
    this.clean();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  useDiscount(discount: IUserDiscount): void {
    const data = {discount};
    this.router.navigateByUrl('/me/reservation', {state: data});
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((stateValue) => {
      if (stateValue.errorMessage || stateValue.message) {
        const snackBarRef = this.snackBar.open(stateValue.errorMessage || stateValue.message, 'OK', {
          duration: 5000
        });

        if (stateValue.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.clean();
            this.getDiscounts();
          });
        } else {
          this.error = stateValue.error;
          return;
        }
      }
      this.dataSource = stateValue.data?.content?.map((ud: IUserDiscount) => {
        if (ud && ud.discount) {
          let symbol;
          switch (ud.discount.type) {
            case DiscountType.money:
              symbol = `$ ${ud.discount.amount}`;
              break;
            case DiscountType.percentage:
              symbol = `${ud.discount.amount} %`;
              break;
          }
          return Object.assign({}, ud, {symbol});
        }
        return ud;
      });
      this.resultsLength = stateValue.data?.totalElements;
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsDiscount.Clean()
    );
  }

  private getDiscounts(): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      page: this.paginator ? this.paginator.pageIndex : 0
    };
    this.store.dispatch(
      new fromActionsDiscount.GetMyDiscounts(payload)
    );
  }
}
