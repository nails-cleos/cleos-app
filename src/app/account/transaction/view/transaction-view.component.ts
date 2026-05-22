import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../interfaces/pagination';
import { ITransaction } from '../../../interfaces/account';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateService } from '@ngx-translate/core';
import { getTransactionsByAccountId } from '../../../store/account.actions';
import { newDateTimestamp } from '../../../util/dates';
import { AuthUserService } from '../../../services/auth-user.service';
import { SharedModule } from '../../../shared/shared.module';
import { BalanceComponent } from '../../balance/balance.component';
import { getAccountTransactionPipe, getCurrentAccountIdPipe } from '../../../store/selectors/account.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { AccountState } from '../../../store/reducers/account.reducers';

@Component({
  selector: 'app-transaction-view',
  templateUrl: './transaction-view.component.html',
  styleUrls: ['./transaction-view.component.scss'],
  imports: [SharedModule, BalanceComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionViewComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<AccountState> = inject(Store<AccountState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly authUserService: AuthUserService = inject(AuthUserService);

  private accountId$ = this.store.pipe(getCurrentAccountIdPipe);
  private accountTransaction$ = this.store.pipe(getAccountTransactionPipe);
  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'timestamp', 'desc');

  private accountIdSignal = toSignal(this.accountId$);
  private accountTransactionSignal = toSignal(this.accountTransaction$);
  private authUserSignal = this.authUserService.authUser;
  private breakpointsSignal = toSignal(
    this.breakpointObserver$, {
      initialValue: {
        matches: false,
        breakpoints: {
          [Breakpoints.XSmall]: false,
          [Breakpoints.Small]: false,
        },
      },
    },
  );

  private transactionsSignal = computed(() => this.accountTransactionSignal()?.transactions);

  paginatorPageIndex = this.tableState.pageIndex;
  dataSourceSignal = computed(() => this.transactionsSignal()?.content?.map((it: ITransaction) =>
    Object.assign({}, it, { date: newDateTimestamp(it.timestamp ?? it.payment?.timestamp) }),
  ));
  resultsLengthSignal = computed(() => this.transactionsSignal()?.totalElements || 0);
  accountSignal = computed(() => this.accountTransactionSignal()?.account);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);
  hasAdminRole = computed(() => this.authUserSignal()?.hasAdminRole ?? false);

  displayedColumns: string[] = [
    'position', 'timestamp', 'amount', 'amountGifted', 'payment.status', 'payment.type', 'actions',
  ];

  expandedTransaction?: ITransaction;
  dateFormat = this.translate.getCurrentLang();
  language = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      const accountId = this.accountIdSignal();

      if (accountId) {
        this.getTransactions();
      }
    });
  }

  private getTransactions = (): void => {
    const accountId = this.accountIdSignal();
    if (accountId) {
      const request = this.tableState.baseRequest();
      this.store.dispatch(
        getTransactionsByAccountId({
          id: accountId,
          ...request,
          size: this.pageSizeSignal(),
        }),
      );
    }
  };
}
