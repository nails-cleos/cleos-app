import { ChangeDetectionStrategy, Component, computed, effect, inject, input, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../interfaces/pagination';
import { ITransaction } from '../../account';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslatePipe } from '@ngx-translate/core';
import { newDateTimestamp } from '../../../util/dates';
import { AuthUserService } from '../../../services/auth-user.service';
import { BalanceComponent } from '../../balance/balance.component';
import { AccountStore } from '../../../store/account.store';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatFooterCell,
  MatFooterCellDef,
  MatFooterRow,
  MatFooterRowDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatList, MatListItem, MatListItemIcon, MatListItemTitle } from '@angular/material/list';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableSkeletonColumn, TableSkeletonComponent } from '../../../shared/skeleton/table-skeleton.component';
import { NavigationService } from '../../../services/navigation.service';

@Component({
  selector: 'app-transaction-view',
  templateUrl: './transaction-view.component.html',
  styleUrls: ['./transaction-view.component.scss'],
  imports: [MatIcon, MatList, MatListItem, MatIconButton, TranslatePipe, CurrencyPipe, DecimalPipe,
    RouterLink, DatePipe, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell,
    MatSortHeader, MatTooltip, MatListItemIcon, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow,
    MatRowDef, MatRow, MatFooterRow, MatFooterRowDef, MatPaginator, BalanceComponent, MatListItemTitle,
    TableSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionViewComponent {
  id = input<string>();

  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly accountStore = inject(AccountStore);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly authUserService: AuthUserService = inject(AuthUserService);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'timestamp', 'desc');

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

  private transactionsSignal = computed(() => this.accountStore.data()?.transactions);

  paginatorPageIndex = this.tableState.pageIndex;
  isLoading = this.accountStore.isLoading;
  dataSourceSignal = computed(() => this.transactionsSignal()?.content?.map((it: ITransaction) =>
    Object.assign({}, it, { date: newDateTimestamp(it.timestamp ?? it.payment?.timestamp) }),
  ));
  resultsLengthSignal = computed(() => this.transactionsSignal()?.totalElements || 0);
  accountSignal = computed(() => this.accountStore.data()?.account);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);
  hasAdminRole = computed(() => this.authUserSignal()?.hasAdminRole ?? false);

  tableColumns: TableSkeletonColumn[] = [
    { key: 'position' },
    { key: 'timestamp' },
    { key: 'amount', hideOnMobile: true },
    { key: 'amountGifted', hideOnMobile: true },
    { key: 'payment.status', hideOnMobile: true },
    { key: 'payment.type', hideOnMobile: true },
    { key: 'actions', hideOnMobile: true },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);

  expandedTransaction?: ITransaction;
  readonly language = this.navigationService.language;

  constructor() {
    effect(() => {
      const accountId = this.id();

      if (accountId) {
        this.accountStore.clean();
        this.getTransactions();
      }
    });
  }

  private getTransactions = (): void => {
    const accountId = this.id();
    if (accountId) {
      const request = this.tableState.baseRequest();
      this.accountStore.loadTransactions(accountId, {
        ...request,
        size: this.pageSizeSignal(),
      });
    }
  };
}
