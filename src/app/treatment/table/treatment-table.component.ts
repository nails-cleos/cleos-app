import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
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

  displayedColumns: string[] = ['date', 'price', 'duration'];

  paginatorPageIndex = signal(0);

  dataSource = computed(() => new MatTableDataSource(this.treatment().map(p => {
    if (p.duration) {
      const duration = convertDuration(p.duration);

      return Object.assign({}, p, { hour: duration.hour, minute: duration.minute });
    }
    return p;
  })));
  resultsLengthSignal = computed(() => this.dataSource().data.length);
  pageSizeSignal = computed(() => PAGE_SIZE);

  dateFormat: string = this.translate.currentLang;

  constructor() {
    effect((onCleanup) => {
      const paginator = this.paginator();
      if (paginator) {
        const sub = paginator.page.subscribe((pageEvent) => {
          this.paginatorPageIndex.set(pageEvent.pageIndex);
        });
        onCleanup(() => sub.unsubscribe());
      }
    });

    effect(() => {
      const dataSource = this.dataSource();
      const paginator = this.paginator();
      const sort = this.sort();
      if (dataSource && paginator && sort) {
        dataSource.paginator = paginator;
        dataSource.sort = sort;
      }
    });
  }
}
