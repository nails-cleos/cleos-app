import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../../interfaces/pagination';
import { IAccountAll, ITransaction } from '../../../interfaces/account';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectAccountState } from '../../../store/app.states';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsAccount from '../../../store/account.actions';
import { detailExpandAnimation } from '../../../util/animation';
import { newDateTimestamp } from '../../../util/dates';
import { AuthUserService } from '../../../services/auth-user.service';
import { SharedModule } from '../../../shared/shared.module';
import { BalanceComponent } from '../../balance/balance.component';

@Component({
  selector: 'app-transaction-view',
  templateUrl: './transaction-view.component.html',
  styleUrls: ['./transaction-view.component.scss'],
  animations: [detailExpandAnimation],
  imports: [SharedModule, BalanceComponent],
})
export class TransactionViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  hasAdminRole: boolean;

  displayedColumns: string[] = [
  	'position', 'timestamp', 'amount', 'amountGifted', 'payment.status', 'payment.type', 'actions',
  ];
  dataSource: any = new MatTableDataSource<Pagination<ITransaction>>();

  expandedTransaction?: ITransaction;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;
  dateFormat: string;
  accountId?: string;
  account?: IAccountAll;
  language: string;

  private subscription?: Subscription;
  private paginatorSubscription?: Subscription;
  private authUserServiceSubscription: Subscription;
  private getState: Observable<any>;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private cdRef: ChangeDetectorRef,
  	breakpointObserver: BreakpointObserver, private translate: TranslateService,
              private authUserService: AuthUserService) {
  	breakpointObserver.observe([
  		Breakpoints.XSmall,
  		Breakpoints.Small,
  	]).subscribe(result => {
  		if (result.matches) {
  			this.pageSize = MOBILE_PAGE_SIZE;
  		}
  	});
  	this.hasAdminRole = false;
  	this.getState = this.store.select(selectAccountState);
  	this.dateFormat = this.translate.currentLang;
  	this.language = this.translate.currentLang;
  	this.authUserServiceSubscription = this.authUserService.authUser.subscribe(
  		value => this.hasAdminRole = value.hasAdminRole,
  	);
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
  	this.authUserServiceSubscription.unsubscribe();
  }

  private createPageSubscriptions = (): void => {
  	this.sort.sortChange.subscribe(() => {
  		this.paginator.pageIndex = 0;
  		this.getTransactions();
  	});
  	this.paginatorSubscription = this.paginator?.page.subscribe(() => this.getTransactions(this.paginator.pageIndex));

  	this.cdRef.detectChanges();
  };

  private clean = (): void => this.store.dispatch(new fromActionsAccount.Clean());

  private getTransactions = (page: number = 0): void => this.store.dispatch(
  	new fromActionsAccount.GetTransactionsByAccountId({
  		active: this.sort.active,
  		direction: this.sort.direction,
  		size: this.pageSize,
  		accountId: this.accountId,
  		page,
  	}),
  );

  private subscribe = (): void => {
  	this.subscription = this.getState.subscribe(state => {
  		if (state.data?.account) {
  			this.account = state.data.account;
  		}
  		this.dataSource = state.data?.transactions?.content?.map((it: ITransaction) =>
  			Object.assign({}, it, { date: newDateTimestamp(it.payment?.timestamp) }),
  		);
  		this.resultsLength = state.data?.transactions?.totalElements || 0;
  		if (!this.paginatorSubscription && this.resultsLength) {
  			this.createPageSubscriptions();
  		}
  	});
  };
}
