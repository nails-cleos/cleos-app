import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../interfaces/pagination';
import { ITransaction } from '../../../interfaces/account';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateService } from '@ngx-translate/core';
import { getTransactionsByAccountId } from '../../../store/account.actions';
import { detailExpandAnimation } from '../../../util/animation';
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
  animations: [detailExpandAnimation],
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

  private sortActive = computed(() => this.sort()?.active ?? 'timestamp');
  private sortDirection = computed(() => this.sort()?.direction ?? 'asc');
  private transactionsSignal = computed(() => this.accountTransactionSignal()?.transactions);

  paginatorPageIndex = signal(0);
  dataSourceSignal = computed(() => this.transactionsSignal()?.content?.map((it: ITransaction) =>
    Object.assign({}, it, { date: newDateTimestamp(it.payment?.timestamp) }),
  ));
  resultsLengthSignal = computed(() => this.transactionsSignal()?.totalElements || 0);
  accountSignal = computed(() => this.accountTransactionSignal()?.account);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);
  hasAdminRole = computed(() => this.authUserSignal()?.hasAdminRole ?? false);

  displayedColumns: string[] = [
    'position', 'timestamp', 'amount', 'amountGifted', 'payment.status', 'payment.type', 'actions',
  ];

  expandedTransaction?: ITransaction;
  dateFormat = this.translate.currentLang;
  language = this.translate.currentLang;

  constructor() {
    effect((onCleanup) => {
      const paginator = this.paginator();
      if (paginator) {
        const sub = paginator.page.subscribe((pageEvent) => {
          this.paginatorPageIndex.set(pageEvent.pageIndex);
        });
        onCleanup(() => sub.unsubscribe());
      }
    });

    effect(() => {
      const page = this.paginatorPageIndex();
      const accountId = this.accountIdSignal();

      if (accountId) {
        this.getTransactions(page);
      }
    });
  }

  private getTransactions = (page: number = 0): void => {
    const accountId = this.accountIdSignal();
    if (accountId) {
      this.store.dispatch(
        getTransactionsByAccountId({
          id: accountId,
          page: page,
          sort: this.sortActive(),
          direction: this.sortDirection(),
          size: this.pageSizeSignal(),
        }),
      );
    }
  };
}
