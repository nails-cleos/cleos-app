import { IUserAll } from '../user/user';

export interface IItem {
  key?: string;
  name: string;
  description?: string;
  netPrice: number;
  grossPrice: number;
  order: number;
}

export interface ITotals {
  subTotal: number;
  discount: number;
  price: number;
  totalPaid: number;
  excBTW: number;
  btw: number;
}

export interface IDiscount {
  key: string;
  name: string;
  description: string;
  value: number;
}

export interface IInvoice {
  id: string;
  paths: string[];
  customer: IUserAll;
  room: IRoomInvoice;
  items: IItem[];
  timestamp: number;
  totals: ITotals;
  discounts: IDiscount[];
  position: number;
}

export interface IRoomInvoice {
  timeZone: string;
  currencyCode: string;
  addressName: string;
  phone: string;
  email: string;
}

export interface IInvoiceData {
  id: string;
  name: string;
  date: Date;
}
