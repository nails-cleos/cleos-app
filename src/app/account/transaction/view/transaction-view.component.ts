import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../../interfaces/pagination';
import { IAccountAll, ITransaction } from '../../../interfaces/account';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectAccountState } from '../../../store/app.states';
import { FormBuilder } from '@angular/forms';
import { AuthUserService } from '../../../services/auth-user.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsAccount from '../../../store/account.actions';
import { detailExpandAnimation } from '../../../util/animation';

@Component({
  selector: 'app-transaction-view',
  templateUrl: './transaction-view.component.html',
  styleUrls: ['./transaction-view.component.scss'],
  animations: [detailExpandAnimation]
})
export class TransactionViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'createdAt', 'amount', 'amountGifted', 'payment.status', 'payment.type', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<ITransaction>>();

  expandedTransaction?: ITransaction;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;
  dateFormat: string;
  accountId?: string;
  account?: IAccountAll;

  private subscription?: Subscription;
  private paginatorSubscription?: Subscription;
  private getState: Observable<any>;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: FormBuilder,
              private authUserService: AuthUserService, private router: Router, private cdRef: ChangeDetectorRef,
              private breakpointObserver: BreakpointObserver, private translate: TranslateService) {
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.pageSize = MOBILE_PAGE_SIZE;
      }
    });
    this.getState = this.store.select(selectAccountState);
    this.dateFormat = this.translate.currentLang;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.clean();
    this.subscribe();
    if (id) {
      this.accountId = id;
    }
  }

  ngAfterViewInit(): void {
    this.getTransactions();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.paginatorSubscription?.unsubscribe();
  }

  private createPageSubscriptions(): void {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.getTransactions();
    });
    this.paginatorSubscription = this.paginator?.page.subscribe(() => this.getTransactions(this.paginator.pageIndex));

    this.cdRef.detectChanges();
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsAccount.Clean()
    );
  }

  private getTransactions(page: number = 0): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      size: this.pageSize,
      accountId: this.accountId,
      page
    };
    this.store.dispatch(
      new fromActionsAccount.AccountFindTransactions(payload)
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.data?.account) {
        this.account = state.data.account;
      }
      this.dataSource = state.data?.transactions?.content;
      this.resultsLength = state.data?.transactions?.totalElements;
      if (!this.paginatorSubscription && this.resultsLength) {
        this.createPageSubscriptions();
      }
    });
  }
}
