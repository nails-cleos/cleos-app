import { HttpParams } from '@angular/common/http';
import { SortDirection } from '@angular/material/sort';

export const createFilter = (page: number, size: number, sort: string, direction: SortDirection,
  filter?: string): HttpParams => {
  let params = new HttpParams().set('page', String(page)).set('size', String(size)).set('sort', sort)
    .set('direction', direction);
  if (filter) {
    params = params.append('filter', filter);
  }

  return params;
};
