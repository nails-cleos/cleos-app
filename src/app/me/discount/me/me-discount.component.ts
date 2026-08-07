import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { createMatTableState } from '@app/util/mat-table-state';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '@app/interfaces/pagination';
import { DiscountType, IUserDiscount } from '@app/discount/discount';
import { TranslatePipe } from '@ngx-translate/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { currencySymbol } from '@app/util/helper';
import { toSignal } from '@angular/core/rxjs-interop';
import { FirebaseService } from '@app/services/firebase.service';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { DecimalPipe, NgClass } from '@angular/common';
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
import { MatSuffix } from '@angular/material/input';
import { DiscountStore } from '@app/store/discount.store';
import { TableSkeletonColumn, TableSkeletonComponent } from '@app/shared/skeleton/table-skeleton.component';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-me-discount',
  templateUrl: './me-discount.component.html',
  styleUrls: ['./me-discount.component.scss'],
  imports: [MatIcon, MatIconButton, TranslatePipe, DecimalPipe, NgClass, MatTable, MatSort,
    MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatSortHeader, MatTooltip, MatFooterCellDef,
    MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRow, MatFooterRowDef, MatPaginator,
    MatSuffix, TableSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeDiscountComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly discountStore = inject(DiscountStore);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly firebaseService = inject(FirebaseService);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'discountCustomer.name', 'asc');

  private discountListSignal = computed(() => {
    const data = this.discountStore.data();
    return data?.kind === 'pagination' ? data.value : undefined;
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
  isLoading = this.discountStore.isLoading;
  dataSourceSignal = computed(() => this.discountListSignal()?.content?.map((ud: IUserDiscount) => {
    if (ud && ud.discountCustomer) {
      let symbol;
      switch (ud.discountCustomer.type) {
        case DiscountType.money:
          symbol = currencySymbol(ud.discountCustomer.discount?.currency);
          break;
        case DiscountType.percentage:
          symbol = '%';
          break;
      }
      return Object.assign({}, ud, { symbol });
    }
    return ud;
  }));
  resultsLengthSignal = computed(() => this.discountListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  tableColumns: TableSkeletonColumn[] = [
    { key: 'position' },
    { key: 'discountCustomer.name' },
    { key: 'discountCustomer.amount' },
    { key: 'used', hideOnMobile: true },
    { key: 'actions' },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);

  constructor() {
    this.firebaseService.logEvent('screen_view', {
      // eslint-disable-next-line camelcase
      firebase_screen: 'Referral page',
      // eslint-disable-next-line camelcase
      firebase_screen_class: 'ReferralsComponent',
    });
    this.discountStore.clean();
    effect(() => {
      const request = this.tableState.baseRequest();
      this.discountStore.loadMyPage({ ...request, size: this.pageSizeSignal() });
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
        this.discountStore.loadMyPage({ ...request, page: 0, size: this.pageSizeSignal() });
        return;
      }

      this.tableState.resetPage();
    });
  }

  useDiscount = (discount: IUserDiscount): void => {
    const data = { discountId: discount.id };
    this.navigationService.navigate(['me', 'reservation'], { state: data });
  };
}
