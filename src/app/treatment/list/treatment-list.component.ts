import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import {
  MatList,
  MatListItem,
  MatListItemIcon,
  MatListSubheaderCssMatStyler,
} from '@angular/material/list';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ITreatmentGroup, ITreatmentGroupAll } from '../treatment';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '@app/interfaces/pagination';
import { CurrencySymbolPipe } from '@app/pipes/currency-symbol.pipe';
import { DialogComponent } from '@app/shared/dialog/generic/dialog.component';
import { TreatmentStore } from '@app/store/treatment.store';
import { createMatTableState } from '@app/util/mat-table-state';
import {
  TableSkeletonColumn,
  TableSkeletonComponent,
} from '@app/shared/skeleton/table-skeleton.component';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-treatment-list',
  templateUrl: './treatment-list.component.html',
  styleUrls: ['./treatment-list.component.scss'],
  imports: [
    MatIcon,
    MatList,
    MatListItem,
    MatListSubheaderCssMatStyler,
    MatIconButton,
    TranslatePipe,
    RouterLink,
    DatePipe,
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
    CurrencySymbolPipe,
    CurrencySymbolPipe,
    TableSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentListComponent {
  private readonly breakpointObserver: BreakpointObserver =
    inject(BreakpointObserver);
  private readonly treatmentStore = inject(TreatmentStore);
  private readonly translateService: TranslateService =
    inject(TranslateService);
  private readonly navigationService: NavigationService =
    inject(NavigationService);
  private readonly dialog: MatDialog = inject(MatDialog);

  private breakpointObserver$ = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small,
  ]);
  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(
    this.paginator,
    this.sort,
    'order',
    'asc',
  );

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
  isLoading = this.treatmentStore.isLoading;
  dataSourceSignal = computed(() => {
    const data = this.treatmentStore.data();
    return data?.kind === 'pagination' ? data.value.content : undefined;
  });
  resultsLengthSignal = computed(() => {
    const data = this.treatmentStore.data();
    return data?.kind === 'pagination' ? data.value.totalElements || 0 : 0;
  });
  pageSizeSignal = computed(() =>
    this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE,
  );

  tableColumns: TableSkeletonColumn[] = [
    { key: 'order' },
    { key: 'name' },
    { key: 'priceFrom', hideOnMobile: true },
    { key: 'actions', hideOnMobile: true },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);

  expanded?: ITreatmentGroup;

  readonly language: string = this.navigationService.language;

  constructor() {
    this.treatmentStore.clean();

    effect(() => {
      const request = this.tableState.baseRequest();
      this.treatmentStore.loadPage({
        ...request,
        size: this.pageSizeSignal(),
      });
    });
    this.tableState.resetOn(this.treatmentStore.response, () =>
      this.treatmentStore.clean(),
    );
  }

  delete = (treatment: ITreatmentGroupAll): void => {
    const title = this.translateService.instant('TREATMENT.DELETED.TITLE');
    const content = this.translateService.instant('TREATMENT.DELETED.CONTENT', {
      name: treatment.name,
    });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: treatment, variant: 'warning' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.treatmentStore.delete(result.id, result.name);
      }
    });
  };
}
