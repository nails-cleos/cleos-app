import { IDiscount, IUserDiscount } from './discount';

export interface IProductGroup {
  id?: string;
  name?: string;
  description?: string;
  durability?: string;
  durabilityMin?: number;
  durabilityMax?: number;
  products?: IProduct[];
}

export interface IProduct {
  id?: string;
  name?: string;
  price?: number;
  deleted?: boolean;
  description?: string;
  duration?: string;
  durationDate?: Date;
  modifiedAt?: string;
  rating?: number;
  primary: boolean;
  errors?: any;
  history?: IProductAll[];
  showHistory?: boolean;
}

export interface IProductAll {
  id: string;
  name: string;
  price: number;
  duration: string;
  description?: string;
  discount?: IDiscount;
  extras?: IExtras;
  primary?: boolean;
  createdAt?: string;
  productId?: string;
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
  additional: number;
  total: number;
  totalPaid: number;
  priceWithDiscount: number;
  priceWithExtras: number;
  priceWithAdditional: number;
  isPaid: boolean;
}

export class Price implements IPrice {
  amount: number;
  discount: number;
  extra: number;
  additional: number;
  total: number;
  totalPaid: number;
  priceWithDiscount: number;
  priceWithExtras: number;
  priceWithAdditional: number;
  isPaid: boolean;

  constructor(price: number = 0, discount: number = 0, extra: number = 0, additional: number = 0, total: number = 0,
              totalPaid: number = 0, priceWithDiscount: number = 0, priceWithExtras = 0, priceWithAdditional = 0) {
    this.amount = price;
    this.discount = discount;
    this.extra = extra;
    this.additional = additional;
    this.total = total;
    this.totalPaid = totalPaid;
    this.priceWithDiscount = priceWithDiscount;
    this.priceWithExtras = priceWithExtras;
    this.priceWithAdditional = priceWithAdditional;
    this.isPaid = this.amount > 0 && this.totalPaid >= this.total;
  }
}

export class Product implements IProduct {
  name: string;
  primary: boolean;
  description: string;
  errors: any;

  constructor(name: string, primary: boolean = false) {
    this.name = name;
    this.primary = primary;
    this.description = '';
    this.errors = {};
  }
}

export class ProductGroup implements IProductGroup {
  constructor() {
  }
}
