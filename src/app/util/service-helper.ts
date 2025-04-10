import { HttpParams } from '@angular/common/http';

export const createFilter = (page: number, size: number, sort?: string, direction?: string,
  filter?: string): HttpParams => {
  let params = new HttpParams().set('page', String(page)).set('size', String(size));
  if (sort) {
    params = params.append('sort', sort);
  }
  if (direction) {
    params = params.append('direction', direction);
  }
  if (filter) {
    params = params.append('filter', filter);
  }

  return params;
};
