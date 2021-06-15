import { IDiscount, IDiscountAll, IUserDiscount } from './discount';

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
  discount?: IDiscount;
}

export interface IProductDiscountDTO {
  products: IProductAll[];
  discounts: IUserDiscount[];
}

export class Product implements IProduct {
  constructor() {
  }
}

export const PAGE_SIZE = 10;
