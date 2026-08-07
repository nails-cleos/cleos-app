import { ChangeDetectionStrategy, Component, computed, effect, inject, input, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
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
  MatTableDataSource,
} from '@angular/material/table';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { IRoomCustomer } from '../../room';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslatePipe } from '@ngx-translate/core';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '@app/interfaces/pagination';
import { createMatTableState } from '@app/util/mat-table-state';
import { TimeDetailPipe } from '@app/pipes/time-detail.pipe';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem, MatListSubheaderCssMatStyler } from '@angular/material/list';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { RoomStore } from '@app/store/room.store';
import { TableSkeletonColumn, TableSkeletonComponent } from '@app/shared/skeleton/table-skeleton.component';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
  imports: [TimeDetailPipe, MatIcon, MatList, MatListItem, MatListSubheaderCssMatStyler, MatIconButton, TranslatePipe,
    RouterLink, DatePipe, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell,
    MatSortHeader, MatTooltip, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow,
    MatFooterRow, MatFooterRowDef, MatPaginator, TableSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersComponent {
  id = input<string>();

  private readonly roomStore = inject(RoomStore);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private customersSignal = this.roomStore.customers;
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

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'days', 'asc');

  paginatorPageIndex = this.tableState.pageIndex;
  isLoading = this.roomStore.isLoading;
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  dataSource = computed(() => new MatTableDataSource(this.customersSignal()));

  tableColumns: TableSkeletonColumn[] = [
    { key: 'position' },
    { key: 'customer' },
    { key: 'days', hideOnMobile: true },
    { key: 'lastTime', hideOnMobile: true },
    { key: 'actions', hideOnMobile: true },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);
  expanded?: IRoomCustomer;

  readonly language: string = this.navigationService.language;

  constructor() {
    effect(() => {
      const dataSource = this.dataSource();
      const paginator = this.tableState.paginator();
      const sort = this.tableState.sort();
      if (dataSource && paginator && sort) {
        dataSource.paginator = paginator;
        dataSource.sort = sort;
      }
    });

    effect(() => {
      const id = this.id();
      if (id) {
        this.roomStore.loadCustomers(id);
      }
    });
  }

  get resultsLength(): number {
    return this.customersSignal()?.length || 0;
  }
}
