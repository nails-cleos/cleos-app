export interface Pagination<T> {
  content: Array<T>;
  totalElements: number;
  totalPages: number;
  number: number; // Page number
}

export const DEFAULT_LENGTH = 3;
