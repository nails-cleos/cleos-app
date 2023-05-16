import { IUserAll } from './user';
import { IRoomAll } from './room';

export interface IItem {
  key?: string;
  name: string;
  description?: string;
  netoPrice: number;
  brutoPrice: number;
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
  customer: IUserAll;
  room: IRoomAll;
  items: IItem[];
  timestamp: number;

  totals: ITotals;
  discount: IDiscount;
}
