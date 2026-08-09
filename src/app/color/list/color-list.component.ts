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
import { IColor } from '../color';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { executeDialogNoWidth } from '@app/util/helper';
import { DialogComponent } from '@app/shared/dialog/generic/dialog.component';
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
import {
  MatList,
  MatListItem,
  MatListItemIcon,
  MatListSubheaderCssMatStyler,
} from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ColorStore } from '@app/store/color.store';
import {
  TableSkeletonColumn,
  TableSkeletonComponent,
} from '@app/shared/skeleton/table-skeleton.component';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-color-list',
  templateUrl: './color-list.component.html',
  styleUrls: ['./color-list.component.scss'],
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
    TableSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorListComponent {
  private readonly breakpointObserver: BreakpointObserver =
    inject(BreakpointObserver);
  private readonly colorStore = inject(ColorStore);
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
  private tableState = createMatTableState(
    this.paginator,
    this.sort,
    'name',
    'asc',
  );

  private readonly colorListSignal = computed(() => {
    const data = this.colorStore.data();
    return data?.kind === 'pagination' ? data.value : undefined;
  });
  private responseSignal = this.colorStore.response;
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
  isLoading = this.colorStore.isLoading;
  dataSourceSignal = computed(() => this.colorListSignal()?.content);
  resultsLengthSignal = computed(
    () => this.colorListSignal()?.totalElements || 0,
  );
  pageSizeSignal = computed(() =>
    this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE,
  );

  tableColumns: TableSkeletonColumn[] = [
    { key: 'position' },
    { key: 'name' },
    { key: 'description', hideOnMobile: true },
    { key: 'actions', hideOnMobile: true },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);

  expandedColor?: IColor;

  readonly language: string = this.navigationService.language;

  constructor() {
    effect(() => {
      const request = this.tableState.baseRequest();
      this.colorStore.loadPage({
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
      this.colorStore.clearResponse();

      if (currentPage === 0) {
        const request = this.tableState.baseRequest();
        this.colorStore.loadPage({
          ...request,
          page: 0,
          size: this.pageSizeSignal(),
        });
        return;
      }

      this.tableState.resetPage();
    });
  }

  edit = (selected: IColor): void => {
    this.navigationService.navigate(['colors', selected.id]);
  };

  delete = (color: IColor): void => {
    const title = this.translateService.instant('COLOR.DELETED.TITLE');
    const content = this.translateService.instant('COLOR.DELETED.CONTENT', {
      name: color.name,
    });

    executeDialogNoWidth(
      this.dialog,
      DialogComponent,
      { title, content, value: color, variant: 'warning' },
      (result) => {
        if (result) {
          this.colorStore.delete({ id: result.id, name: result.name });
        }
      },
    );
  };
}
