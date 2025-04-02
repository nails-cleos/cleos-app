import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

export class PaginatorI18n {

  constructor(private readonly translate: TranslateService) {
  }

  getPaginatorIntl = (): MatPaginatorIntl => {
    const paginatorIntl = new MatPaginatorIntl();
    paginatorIntl.itemsPerPageLabel = this.translate.instant('COMMON.PAGINATOR.ITEMS_PER_PAGE_LABEL');
    paginatorIntl.nextPageLabel = this.translate.instant('COMMON.PAGINATOR.NEXT_PAGE_LABEL');
    paginatorIntl.previousPageLabel = this.translate.instant('COMMON.PAGINATOR.PREVIOUS_PAGE_LABEL');
    paginatorIntl.firstPageLabel = this.translate.instant('COMMON.PAGINATOR.FIRST_PAGE_LABEL');
    paginatorIntl.lastPageLabel = this.translate.instant('COMMON.PAGINATOR.LAST_PAGE_LABEL');
    paginatorIntl.getRangeLabel = this.getRangeLabel.bind(this);

    return paginatorIntl;
  };

  private getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return this.translate.instant('COMMON.PAGINATOR.RANGE_PAGE_LABEL_1', { length });
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;

    return this.translate.instant('COMMON.PAGINATOR.RANGE_PAGE_LABEL_2',
      { startIndex: startIndex + 1, endIndex, length });
  };
}
