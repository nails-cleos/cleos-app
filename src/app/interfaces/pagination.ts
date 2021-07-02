export interface Pagination<T> {
  content: Array<T>;
  totalElements: number;
  totalPages: number;
  number: number; // Page number
}

export const PAGE_SIZE = 10;
export const MOBILE_PAGE_SIZE = 5;
export const DEFAULT_LENGTH = 3;
