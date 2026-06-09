import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { IDiscount, IDiscountAll } from '../discount';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { executeDialog } from '../../util/helper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DiscountDialogComponent, DiscountDialogData } from './discount-dialog.component';
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
import { MatList, MatListItem, MatListSubheaderCssMatStyler } from '@angular/material/list';
import { MatPrefix, MatSuffix } from '@angular/material/input';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { discountIcon, DiscountStore } from '../../store/discount.store';

@Component({
  selector: 'app-discount-list',
  templateUrl: './discount-list.component.html',
  styleUrls: ['./discount-list.component.scss'],
  imports: [MatIcon, MatList, MatListItem, MatListSubheaderCssMatStyler, MatIconButton,
    TranslatePipe, DecimalPipe, RouterLink, MatIcon, MatTooltip, MatTable, MatSort, MatColumnDef, MatHeaderCellDef,
    MatHeaderCell, MatCellDef, MatCell, MatSortHeader, MatSuffix, MatPrefix, MatFooterCellDef, MatFooterCell,
    MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRowDef, MatFooterRow, MatPaginator],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountListComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly discountStore = inject(DiscountStore);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly router = inject(Router);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'name', 'asc');

  private discountListSignal = computed(() => {
    const data = this.discountStore.data();
    return data?.kind === 'paginationDiscount' ? data.value : undefined;
  });
  private responseSignal = this.discountStore.response;
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

  paginatorPageIndex = this.tableState.pageIndex;
  dataSourceSignal = computed(() => this.discountListSignal()?.content?.map((it: IDiscount) => {
    return Object.assign({}, it, { icon: discountIcon(it as IDiscountAll) });
  }));
  resultsLengthSignal = computed(() => this.discountListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['position', 'name', 'description', 'type', 'amount', 'actions'];
  expanded?: IDiscount;

  language: string = this.translate.getCurrentLang();

  constructor() {
    this.discountStore.clean();

    effect(() => {
      const request = this.tableState.baseRequest();
      this.discountStore.loadPage({ ...request, size: this.pageSizeSignal() });
    });

    effect(() => {
      const response = this.responseSignal();
      if (!response) {
        return;
      }

      const currentPage = this.paginatorPageIndex();
      this.discountStore.clearResponse();

      if (currentPage === 0) {
        const request = this.tableState.baseRequest();
        this.discountStore.loadPage({ ...request, page: 0, size: this.pageSizeSignal() });
        return;
      }

      this.tableState.resetPage();
    });
  }

  edit = (selected: IDiscount): void => {
    void this.router.navigate([this.language, 'discounts', selected.id]);
  };

  delete = (discount: IDiscount): void => {
    const title = this.translate.instant('DISCOUNT.DELETED.TITLE');
    const content = this.translate.instant('DISCOUNT.DELETED.CONTENT', { name: discount.name });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: discount, variant: 'warning' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.discountStore.delete(result.id, result.name);
      }
    });
  };

  sentToUsers = (discount: IDiscountAll): void => {
    const data: DiscountDialogData = { discount };
    executeDialog(this.dialog, DiscountDialogComponent, data, result => {
      if (result) {
        this.discountStore.sendToCustomers(result.discountId, result.customerIds);
      }
    }, true);
  };

}
