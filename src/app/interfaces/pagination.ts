import { HttpContext, HttpContextToken } from '@angular/common/http';

export interface Pagination<T> {
  content: Array<T>;
  totalElements: number;
  totalPages: number;
  // eslint-disable-next-line id-blacklist
  number: number; // Page number
  last?: boolean;
}

export const PAGE_SIZE = 10;
export const MOBILE_PAGE_SIZE = 5;

export class EmptyPagination<T> implements Pagination<T> {
  content: Array<T> = [];
  totalElements: number = 0;
  totalPages: number = 0;
  // eslint-disable-next-line id-blacklist
  number: number = 0; // Page number
  last: boolean = true;
}

export const EXPECT_PAGINATION = new HttpContextToken<boolean>(() => false);
export const SKIP_LOADING_OVERLAY = new HttpContextToken<boolean>(() => false);

export const paginated = () => ({
  context: new HttpContext()
    .set(EXPECT_PAGINATION, true)
    .set(SKIP_LOADING_OVERLAY, true),
});

export const skipLoadingOverlay = () => ({
  context: new HttpContext().set(SKIP_LOADING_OVERLAY, true),
});
