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
export const DEFAULT_LENGTH = 3;
