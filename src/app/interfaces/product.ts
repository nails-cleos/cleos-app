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
  modifiedAt?: string;
  rating?: number;
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

export interface IPrice {
  amount: number;
  discount: number;
  extra: number;
  total: number;
  totalPaid: number;
  priceWithDiscount: number;
  priceWithExtras: number;
  isPaid: boolean;
}

export class Price implements IPrice {
  amount: number;
  discount: number;
  extra: number;
  total: number;
  totalPaid: number;
  priceWithDiscount: number;
  priceWithExtras: number;
  isPaid: boolean;

  constructor(price: number = 0, discount: number = 0, extra: number = 0, total: number = 0, totalPaid: number = 0,
              priceWithDiscount: number = 0, priceWithExtras = 0) {
    this.amount = price;
    this.discount = discount;
    this.extra = extra;
    this.total = total;
    this.totalPaid = totalPaid;
    this.priceWithDiscount = priceWithDiscount;
    this.priceWithExtras = priceWithExtras;
    this.isPaid = this.amount > 0 && this.totalPaid >= this.total;
  }
}

export class Product implements IProduct {
  constructor() {
  }
}
