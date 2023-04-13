import { AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ITreatmentAll } from '../../interfaces/treatment';
import { DEFAULT_LENGTH, PAGE_SIZE } from '../../interfaces/pagination';
import { convertDuration } from '../../util/dates';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-treatment-table',
  templateUrl: './treatment-table.component.html',
  styleUrls: ['./treatment-table.component.scss']
})
export class TreatmentTableComponent implements AfterViewInit, OnChanges {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Input() treatment: ITreatmentAll[] = [];

  displayedColumns: string[] = ['date', 'price', 'duration'];
  dataSource: any = new MatTableDataSource<ITreatmentAll>();

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;
  language: string;

  constructor(protected translate: TranslateService) {
    this.language = translate.currentLang;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource = this.treatment?.map(p => {
      if (p.duration) {
        const duration = convertDuration(p.duration);

        return Object.assign({}, p, {hour: duration.hour, minute: duration.minute});
      }
      return p;
    });
    this.resultsLength = this.treatment.length;
  }
}
