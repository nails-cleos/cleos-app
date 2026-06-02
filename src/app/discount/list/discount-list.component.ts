import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { DiscountType, IDiscount, IDiscountAll } from '../../interfaces/discount';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import {
  cleanDiscount,
  deleteDiscount,
  discountSelected,
  getDiscountsPage,
  sendDiscountToCustomers,
} from '../../store/actions/discount.actions';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { executeDialog } from '../../util/helper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DiscountDialogComponent, DiscountDialogData } from './discount-dialog.component';
import { getDiscountPaginationPipe, getDiscountResponsePipe } from '../../store/selectors/discount.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { DiscountState } from '../../store/reducers/discount.reducers';
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
import { RouterLink } from '@angular/router';

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
  private readonly store: Store<DiscountState> = inject(Store<DiscountState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private discountList$ = this.store.pipe(getDiscountPaginationPipe);
  private response$ = this.store.pipe(getDiscountResponsePipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'name', 'asc');

  private discountListSignal = toSignal(this.discountList$);
  private responseSignal = toSignal(this.response$);
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
    let icon = '';
    switch (it.type) {
      case DiscountType.money:
        icon = it.currency?.icon ?? 'euro';
        break;
      case DiscountType.percentage:
        icon = 'percent';
    }
    return Object.assign({}, it, { icon });
  }));
  resultsLengthSignal = computed(() => this.discountListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['position', 'name', 'description', 'type', 'amount', 'actions'];
  expanded?: IDiscount;

  language: string = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      const request = this.tableState.baseRequest();
      this.store.dispatch(
        getDiscountsPage({
          ...request,
          size: this.pageSizeSignal(),
        }),
      );
    });
    this.tableState.resetOn(this.responseSignal, () => this.store.dispatch(cleanDiscount()));
  }

  edit = (selected: IDiscount): void => this.store.dispatch(discountSelected({ selected }));

  delete = (discount: IDiscount): void => {
    const title = this.translate.instant('DISCOUNT.DELETED.TITLE');
    const content = this.translate.instant('DISCOUNT.DELETED.CONTENT', { name: discount.name });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: discount, variant: 'warning' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(deleteDiscount({ id: result.id, name: result.name }));
      }
    });
  };

  sentToUsers = (discount: IDiscountAll): void => {
    const data: DiscountDialogData = { discount };
    executeDialog(this.dialog, DiscountDialogComponent, data, result => {
      if (result) {
        this.store.dispatch(
          sendDiscountToCustomers({ id: result.discountId, customersDiscount: result.customerIds }),
        );
      }
    }, true);
  };

}
