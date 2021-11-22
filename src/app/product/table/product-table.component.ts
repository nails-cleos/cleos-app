import { AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IProductAll } from '../../interfaces/product';
import { DEFAULT_LENGTH, PAGE_SIZE } from '../../interfaces/pagination';
import { convertDuration } from '../../util/dates';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-product-table',
  templateUrl: './product-table.component.html',
  styleUrls: ['./product-table.component.scss']
})
export class ProductTableComponent implements AfterViewInit, OnChanges {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Input() product: IProductAll[] = [];

  displayedColumns: string[] = ['date', 'price', 'duration'];
  dataSource: any = new MatTableDataSource<IProductAll>();

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
    this.dataSource = this.product?.map(p => {
      if (p.duration) {
        const duration = convertDuration(p.duration);

        return Object.assign({}, p, {hour: duration.hour, minute: duration.minute});
      }
      return p;
    });
    this.resultsLength = this.product.length;
  }
}
