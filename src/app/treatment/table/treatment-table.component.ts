import { ChangeDetectionStrategy, Component, computed, effect, inject, input, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { ITreatmentAll } from '../../interfaces/treatment';
import { convertDuration } from '../../util/dates';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { PAGE_SIZE } from '../../interfaces/pagination';

@Component({
  selector: 'app-treatment-table',
  templateUrl: './treatment-table.component.html',
  styleUrls: ['./treatment-table.component.scss'],
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentTableComponent {
  private readonly translate = inject(TranslateService);

  treatment = input<ITreatmentAll[]>([]);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'date', 'asc');

  displayedColumns: string[] = ['date', 'price', 'duration'];

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
