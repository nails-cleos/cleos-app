import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { IOffice } from '../office';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
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
import { RouterLink } from '@angular/router';
import { OfficeStore } from '../../store/office.store';
import { TableSkeletonColumn, TableSkeletonComponent } from '../../shared/skeleton/table-skeleton.component';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-office-list',
  templateUrl: './office-list.component.html',
  styleUrls: ['./office-list.component.scss'],
  imports: [MatIcon, MatList, MatListItem, MatListSubheaderCssMatStyler, MatIconButton,
    TranslatePipe, RouterLink, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell,
    MatSortHeader, MatTooltip, MatListItemIcon, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow,
    MatRowDef, MatRow, MatFooterRow, MatFooterRowDef, MatPaginator, TableSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficeListComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly officeStore = inject(OfficeStore);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly navigationService: NavigationService = inject(NavigationService);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'name', 'asc');

  private officeListSignal = computed(() => {
    const data = this.officeStore.data();
    return data?.kind === 'pagination' ? data.value : undefined;
  });
  private responseSignal = this.officeStore.response;
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
  isLoading = this.officeStore.isLoading;
  dataSourceSignal = computed(() => this.officeListSignal()?.content);
  resultsLengthSignal = computed(() => this.officeListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  tableColumns: TableSkeletonColumn[] = [
    { key: 'position' },
    { key: 'name' },
    { key: 'manager', hideOnMobile: true },
    { key: 'subject' },
    { key: 'actions', hideOnMobile: true },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);
  expanded?: IOffice;

  readonly language: string = this.navigationService.language;

  constructor() {
    this.officeStore.clean();
    effect(() => {
      const request = this.tableState.baseRequest();
      this.officeStore.loadPage({
        ...request,
        size: this.pageSizeSignal(),
      });
    });
    this.tableState.resetOn(this.responseSignal, () => this.officeStore.clearResponse());
  }

  edit = (selected: IOffice): void => {
    void this.navigationService.navigate(['offices', selected.id]);
  };

  delete = (office: IOffice): void => {
    const title = this.translate.instant('OFFICE.DELETED.TITLE');
    const content = this.translate.instant('OFFICE.DELETED.CONTENT', { name: office.name });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: office, variant: 'warning' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.officeStore.delete(result.id, result.name);
      }
    });
  };
}
