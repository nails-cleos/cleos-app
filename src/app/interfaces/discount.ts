import { IUserAll } from './user';
import { ICurrency } from './currency';

export enum DiscountType {
  money = 'MONEY',
  percentage = 'PERCENTAGE'
}

export interface IDiscount {
  id?: string;
  name?: string;
  description?: string;
  amount?: number;
  type?: string;
  deleted?: boolean;
  currency?: ICurrency;
  currencyId?: string;
}

export interface IDiscountAll {
  id: string;
  name: string;
  amount: number;
  type: DiscountType;
  currency: ICurrency;
  description?: string;
}

export interface IUserDiscount {
  id: string;
  discountCustomer: IDiscountAll;
  used: boolean;
  title?: string;
  symbol?: string;
}

export interface IReferral {
  id: string;
  referenced: IUserAll;
  customer: IUserAll;
  used: boolean;
}

export class Discount implements IDiscount {
  constructor() {
  }
}
