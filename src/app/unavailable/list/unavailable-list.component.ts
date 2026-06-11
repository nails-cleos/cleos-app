import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { getCurrentTimeZone, isSameTimeZone, newDateTimestamp } from '../../util/dates';
import { IUnavailable, IUnavailableAll } from '../unavailable';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { createDialog, executeDialogNoWidth } from '../../util/helper';
import { TimeDetailPipe } from '../../pipes/time-detail.pipe';
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
import { MatList, MatListItem, MatListItemIcon, MatListSubheaderCssMatStyler } from '@angular/material/list';
import { MatPrefix } from '@angular/material/input';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DurationTimePipe } from '../../pipes/durationTime.pipe';
import { UnavailableStore } from '../../store/unavailable.store';
import { TableSkeletonColumn, TableSkeletonComponent } from '../../shared/skeleton/table-skeleton.component';

@Component({
  selector: 'app-unavailable-list',
  templateUrl: './unavailable-list.component.html',
  styleUrls: ['./unavailable-list.component.scss'],
  imports: [TimeDetailPipe, MatIcon, MatList, MatListItem, MatListSubheaderCssMatStyler, MatIconButton,
    TranslatePipe, RouterLink, DatePipe, MatTable, MatSort, MatColumnDef, MatHeaderCellDef,
    MatHeaderCell, MatCellDef, MatCell, MatSortHeader, MatTooltip, MatListItemIcon, MatFooterCellDef, MatFooterCell,
    MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRow, MatFooterRowDef, MatPaginator, MatPrefix,
    TimeDetailPipe, DurationTimePipe, TableSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnavailableListComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly unavailableStore = inject(UnavailableStore);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly router: Router = inject(Router);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'timestamp', 'desc');

  private unavailableListSignal = this.unavailableStore.data;
  private responseSignal = this.unavailableStore.response;
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
  isLoading = this.unavailableStore.isLoading;
  dataSourceSignal = computed(() => this.unavailableListSignal()?.content);
  resultsLengthSignal = computed(() => this.unavailableListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  tableColumns: TableSkeletonColumn[] = [
    { key: 'position' },
    { key: 'professional', hideOnMobile: true },
    { key: 'description', hideOnMobile: true },
    { key: 'timestamp' },
    { key: 'duration', hideOnMobile: true },
    { key: 'repeat', hideOnMobile: true },
    { key: 'actions', hideOnMobile: true },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);

  expandedUnavailable?: IUnavailable;

  dateFormat: string = this.translate.getCurrentLang();
  language: string = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      const request = this.tableState.baseRequest();
      this.unavailableStore.loadPage({
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
      this.unavailableStore.clearResponse();

      if (currentPage === 0) {
        const request = this.tableState.baseRequest();
        this.unavailableStore.loadPage({
          ...request,
          page: 0,
          size: this.pageSizeSignal(),
        });
        return;
      }

      this.tableState.resetPage();
    });
  }

  edit = (selected: IUnavailableAll): void => {
    const path = selected.type === 'BLOCK_AGENDA'
      ? ['unavailable', 'block-agenda', selected.id]
      : ['unavailable', selected.id];

    void this.router.navigate([this.language, ...path]);
  };

  delete = (unavailable: IUnavailableAll): void => {
    const title = this.translate.instant('UNAVAILABLE.DELETED.TITLE');
    const content = this.translate.instant('UNAVAILABLE.DELETED.CONTENT',
      { date: newDateTimestamp(unavailable.timestamp) });

    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: unavailable, variant: 'warning' }, result => {
      if (result) {
        this.unavailableStore.delete({
          id: result.id,
          timestamp: result.timestamp,
          timeZone: result.timeZone,
        });
      }
    });
  };

  showTimeZone = (unavailable: IUnavailableAll): boolean =>
    !isSameTimeZone(unavailable.timeZone || unavailable.professional.timeZone || getCurrentTimeZone());

  openDialog = (unavailable: IUnavailableAll): void => {
    const time = newDateTimestamp(unavailable.timestamp);
    const name = unavailable.professional.displayName;
    const timeZone = unavailable.timeZone || unavailable.professional.timeZone;
    createDialog('PROFESSIONAL_INFO', name, this.dateFormat, this.translate, this.dialog, timeZone, time);
  };
}
