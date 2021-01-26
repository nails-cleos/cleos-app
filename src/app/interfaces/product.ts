export interface IProduct {
  id?: string;
  name?: string;
  price?: number;
  deleted?: boolean;
  description?: string;
  duration?: string;
  durationDate?: Date;
}

export class Product implements IProduct {
  constructor() {
  }
}

export const PAGE_SIZE = 10;
