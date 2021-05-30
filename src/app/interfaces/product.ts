export interface IProduct {
  id?: string;
  name?: string;
  price?: number;
  deleted?: boolean;
  description?: string;
  duration?: string;
  durationDate?: Date;
  durability?: string;
}

export interface IProductAll {
  id: string;
  name: string;
  price: number;
  duration: string;
  description?: string;
  durability?: string;
}

export class Product implements IProduct {
  constructor() {
  }
}

export const PAGE_SIZE = 10;
