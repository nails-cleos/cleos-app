import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { createMatTableState } from '@app/util/mat-table-state';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '@app/interfaces/pagination';
import { ICurrency } from '../currency';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DialogComponent } from '@app/shared/dialog/generic/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { executeDialogNoWidth } from '@app/util/helper';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
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
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import {
  MatList,
  MatListItem,
  MatListItemIcon,
  MatListItemTitle,
  MatListSubheaderCssMatStyler,
} from '@angular/material/list';
import { CurrencyStore } from '@app/store/currency.store';
import {
  TableSkeletonColumn,
  TableSkeletonComponent,
} from '@app/shared/skeleton/table-skeleton.component';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-currency-list',
  templateUrl: './currency-list.component.html',
  styleUrls: ['./currency-list.component.scss'],
  imports: [
    MatIcon,
    MatList,
    MatListItem,
    MatListSubheaderCssMatStyler,
    MatIconButton,
    TranslatePipe,
    RouterLink,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatSortHeader,
    MatTooltip,
    MatListItemIcon,
    MatFooterCellDef,
    MatFooterCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatFooterRow,
    MatFooterRowDef,
    MatPaginator,
    MatListItemTitle,
    TableSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyListComponent {
  private readonly breakpointObserver: BreakpointObserver =
    inject(BreakpointObserver);
  private readonly currencyStore = inject(CurrencyStore);
  private readonly translateService: TranslateService =
    inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly navigationService: NavigationService =
    inject(NavigationService);

  private breakpointObserver$ = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small,
  ]);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  readonly tableState = createMatTableState(
    this.paginator,
    this.sort,
    'code',
    'asc',
  );

  private readonly currencyListSignal = computed(() => {
    const data = this.currencyStore.data();
    return data?.kind === 'pagination' ? data.value : undefined;
  });
  private responseSignal = this.currencyStore.response;
  private breakpointsSignal = toSignal(this.breakpointObserver$, {
    initialValue: {
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    },
  });

  paginatorPageIndex = this.tableState.pageIndex;
  isLoading = this.currencyStore.isLoading;
  dataSourceSignal = computed(() => this.currencyListSignal()?.content);
  resultsLengthSignal = computed(
    () => this.currencyListSignal()?.totalElements || 0,
  );
  pageSizeSignal = computed(() =>
    this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE,
  );

  tableColumns: TableSkeletonColumn[] = [
    { key: 'position' },
    { key: 'code' },
    { key: 'name', hideOnMobile: true },
    { key: 'actions', hideOnMobile: true },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);
  expanded?: ICurrency;

  readonly language: string = this.navigationService.language;

  constructor() {
    effect(() => {
      const request = this.tableState.baseRequest();
      this.currencyStore.loadPage({
        ...request,
        size: this.pageSizeSignal(),
      });
    });

    effect(() => {
      const response = this.responseSignal();
      if (!response) {
        return;
      }

      const currentPage = this.paginatorPageIndex();
      this.currencyStore.clearResponse();

      if (currentPage === 0) {
        const request = this.tableState.baseRequest();
        this.currencyStore.loadPage({
          ...request,
          page: 0,
          size: this.pageSizeSignal(),
        });
        return;
      }

      this.tableState.resetPage();
    });
  }

  edit = (selected: ICurrency): void => {
    this.navigationService.navigate(['currency', selected.id]);
  };

  delete = (currency: ICurrency): void => {
    const title = this.translateService.instant('CURRENCY.DELETED.TITLE');
    const content = this.translateService.instant('CURRENCY.DELETED.CONTENT', {
      code: currency.code,
    });
    executeDialogNoWidth(
      this.dialog,
      DialogComponent,
      { title, content, value: currency, variant: 'warning' },
      (result) => {
        if (result) {
          this.currencyStore.delete({ id: result.id, code: result.code });
        }
      },
    );
  };
}
