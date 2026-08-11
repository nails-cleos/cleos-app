import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface TableSkeletonColumn {
  key: string;
  hideOnMobile?: boolean;
}

@Component({
  selector: 'app-table-skeleton',
  templateUrl: './table-skeleton.component.html',
  styleUrl: './table-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSkeletonComponent {
  columns = input.required<TableSkeletonColumn[]>();
  rowCount = input(3);
  showHeader = input(true);
  showPaginator = input(false);

  rows = (): number[] =>
    Array.from({ length: this.rowCount() }, (_, index) => index);
}
