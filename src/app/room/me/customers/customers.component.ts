import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { getAllCustomersInfo } from '../../../store/room.actions';
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
import { IRoomCustomer } from '../../../interfaces/room';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../interfaces/pagination';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { TimeDetailPipe } from '../../../pipes/time-detail.pipe';
import { RoomState } from '../../../store/reducers/room.reducers';
import { getCurrentRoomIdPipe, getCustomersPipe } from '../../../store/selectors/room.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem, MatListSubheaderCssMatStyler } from '@angular/material/list';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
  imports: [TimeDetailPipe, MatIcon, MatList, MatListItem, MatListSubheaderCssMatStyler, MatIconButton, TranslatePipe,
    RouterLink, DatePipe, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell,
    MatSortHeader, MatTooltip, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow,
    MatFooterRow, MatFooterRowDef, MatPaginator],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersComponent {
  private readonly store: Store<RoomState> = inject(Store<RoomState>);
  private readonly translate = inject(TranslateService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  private roomId$ = this.store.pipe(getCurrentRoomIdPipe);
  private customers$ = this.store.pipe(getCustomersPipe);
  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private roomIdSignal = toSignal(this.roomId$);
  private customersSignal = toSignal(this.customers$);
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
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  dataSource = computed(() => new MatTableDataSource(this.customersSignal()));

  displayedColumns: string[] = ['position', 'customer', 'days', 'lastTime', 'actions'];
  expanded?: IRoomCustomer;

  language: string = this.translate.getCurrentLang();

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
      const id = this.roomIdSignal();
      if (id) {
        this.store.dispatch(getAllCustomersInfo({ id }));
      }
    });
  }

  get resultsLength(): number {
    return this.customersSignal()?.length || 0;
  }
}
