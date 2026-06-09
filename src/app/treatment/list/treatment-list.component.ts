import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem, MatListItemIcon, MatListSubheaderCssMatStyler } from '@angular/material/list';
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
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { CurrencySymbolPipe } from '../../pipes/currency-symbol.pipe';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { TreatmentStore } from '../../store/treatment.store';
import { createMatTableState } from 'src/app/util/mat-table-state';

@Component({
  selector: 'app-treatment-list',
  templateUrl: './treatment-list.component.html',
  styleUrls: ['./treatment-list.component.scss'],
  imports: [MatIcon, MatList, MatListItem, MatListSubheaderCssMatStyler, MatIconButton,
    TranslatePipe, RouterLink, DatePipe, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef,
    MatCell, MatSortHeader, MatTooltip, MatListItemIcon, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow,
    MatRowDef, MatRow, MatFooterRow, MatFooterRowDef, MatPaginator, CurrencySymbolPipe, CurrencySymbolPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentListComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly treatmentStore = inject(TreatmentStore);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'order', 'asc');

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
  dataSourceSignal = computed(() => {
    const data = this.treatmentStore.data();
    return data?.kind === 'pagination' ? data.value.content : undefined;
  });
  resultsLengthSignal = computed(() => {
    const data = this.treatmentStore.data();
    return data?.kind === 'pagination' ? data.value.totalElements || 0 : 0;
  });
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['order', 'name', 'priceFrom', 'actions'];

  expanded?: ITreatmentGroup;

  dateFormat: string = this.translate.getCurrentLang();
  language: string = this.translate.getCurrentLang();

  constructor() {
    this.treatmentStore.clean();

    effect(() => {
      const request = this.tableState.baseRequest();
      this.treatmentStore.loadPage({
        ...request,
        size: this.pageSizeSignal(),
      });
    });
    this.tableState.resetOn(this.treatmentStore.response, () => this.treatmentStore.clean());
  }

  delete = (treatment: ITreatmentGroupAll): void => {
    const title = this.translate.instant('TREATMENT.DELETED.TITLE');
    const content = this.translate.instant('TREATMENT.DELETED.CONTENT', { name: treatment.name });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: treatment, variant: 'warning' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.treatmentStore.delete({ id: result.id, name: result.name });
      }
    });
  };
}
