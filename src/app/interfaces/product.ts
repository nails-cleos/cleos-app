import { IDiscount, IUserDiscount } from './discount';

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
  extras?: IExtras;
}

export interface IProductDiscountDTO {
  products: IProductAll[];
  discounts: IUserDiscount[];
}

export interface IExtras {
  description?: string;
  price?: number;
}

export class Product implements IProduct {
  constructor() {
  }
}
