import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { inject } from '@angular/core';

export class PaginatorI18n {
  private readonly translateService: TranslateService = inject(TranslateService);

  getPaginatorIntl = (): MatPaginatorIntl => {
    const paginatorIntl = new MatPaginatorIntl();
    paginatorIntl.itemsPerPageLabel = this.translateService.instant('COMMON.PAGINATOR.ITEMS_PER_PAGE_LABEL');
    paginatorIntl.nextPageLabel = this.translateService.instant('COMMON.PAGINATOR.NEXT_PAGE_LABEL');
    paginatorIntl.previousPageLabel = this.translateService.instant('COMMON.PAGINATOR.PREVIOUS_PAGE_LABEL');
    paginatorIntl.firstPageLabel = this.translateService.instant('COMMON.PAGINATOR.FIRST_PAGE_LABEL');
    paginatorIntl.lastPageLabel = this.translateService.instant('COMMON.PAGINATOR.LAST_PAGE_LABEL');
    paginatorIntl.getRangeLabel = this.getRangeLabel.bind(this);

    return paginatorIntl;
  };

  private getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return this.translateService.instant('COMMON.PAGINATOR.RANGE_PAGE_LABEL_1', { length });
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;

    return this.translateService.instant('COMMON.PAGINATOR.RANGE_PAGE_LABEL_2',
      { startIndex: startIndex + 1, endIndex, length });
  };
}
