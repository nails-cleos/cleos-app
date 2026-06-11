import { ChangeDetectionStrategy, Component, computed, effect, inject, input, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
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
import { createMatTableState } from 'src/app/util/mat-table-state';
import { ITreatmentAll } from '../treatment';
import { convertDuration } from '../../util/dates';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PAGE_SIZE } from '../../interfaces/pagination';
import { MatPrefix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TableSkeletonColumn } from '../../shared/skeleton/table-skeleton.component';

@Component({
  selector: 'app-treatment-table',
  templateUrl: './treatment-table.component.html',
  styleUrls: ['./treatment-table.component.scss'],
  imports: [MatIcon, TranslatePipe, DecimalPipe, DatePipe, MatTable, MatColumnDef,
    MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatFooterCellDef, MatFooterCell, MatHeaderRowDef,
    MatHeaderRow, MatRowDef, MatRow, MatFooterRow, MatFooterRowDef, MatPaginator, MatPrefix],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentTableComponent {
  private readonly translate = inject(TranslateService);

  treatment = input<ITreatmentAll[]>([]);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'date', 'asc');

  tableColumns: TableSkeletonColumn[] = [
    { key: 'date' },
    { key: 'price' },
    { key: 'duration', hideOnMobile: true },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);

  paginatorPageIndex = this.tableState.pageIndex;

  dataSource = computed(() => new MatTableDataSource(this.treatment().map(p => {
    if (p.duration) {
      const duration = convertDuration(p.duration);

      return Object.assign({}, p, { hour: duration.hour, minute: duration.minute });
    }
    return p;
  })));
  resultsLengthSignal = computed(() => this.dataSource().data.length);
  pageSizeSignal = computed(() => PAGE_SIZE);

  dateFormat: string = this.translate.getCurrentLang();

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
  }
}
