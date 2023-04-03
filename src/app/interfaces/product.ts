import { IDiscount, IUserDiscount } from './discount';
import { IAdditionalAll } from './additional';
import { IService } from './room';

export interface IProductGroup {
  id?: string;
  name?: string;
  description?: string;
  durability?: string;
  durabilityMin?: number;
  durabilityMax?: number;
  products?: IProduct[];
}

export interface IProductGroupAll {
  id: string;
  name: string;
  description?: string;
  durability?: string;
  durabilityMin?: number;
  durabilityMax?: number;
}

export interface IProduct {
  id?: string;
  name?: string;
  price?: number;
  deleted?: boolean;
  description?: string;
  time?: string;
  duration?: string;
  durationDate?: Date;
  modifiedAt?: string;
  rating?: number;
  primary: boolean;
  errors?: any;
  history?: IProductAll[];
  showHistory?: boolean;
}

export interface IGroupService {
  id: string;
  name: string;
  products: IService[];
  selectedProducts: IService[];
}

export interface IProductAll extends IService {
  duration: string;
  description?: string;
  discount?: IDiscount;
  extras?: IExtras;
  primary?: boolean;
  createdAt?: string;
  productId?: string;
  group: IProductGroupAll;
}

export interface IProductDiscountDTO {
  products: IProductAll[];
  discounts: IUserDiscount[];
  additionalList: IAdditionalAll[];
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
  toPaid: number;
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
  toPaid: number;

  constructor(price: number = 0, discount: number = 0, extra: number = 0, additional: number = 0, total: number = 0,
              totalPaid: number = 0, priceWithDiscount: number = 0, priceWithExtras = 0, priceWithAdditional = 0,
              toPaid: number = 0) {
    this.amount = price;
    this.discount = discount;
    this.extra = extra;
    this.additional = additional;
    this.total = total;
    this.totalPaid = totalPaid;
    this.priceWithDiscount = priceWithDiscount;
    this.priceWithExtras = priceWithExtras;
    this.priceWithAdditional = priceWithAdditional;
    this.toPaid = toPaid;
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

export class GroupService implements IGroupService {
  id: string;
  name: string;
  products: IService[];
  selectedProducts: IService[];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.products = [];
    this.selectedProducts = [];
  }
}
