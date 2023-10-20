import { IUser, IUserAll } from './user';
import { ICurrency, ICurrencyAll } from './currency';
import { IPayment, PaymentType } from './payment';
import { Pagination } from './pagination';

export interface IAccount {
  id?: string;
  balance?: number;
  deleted?: boolean;
  customer?: IUser;
  customerId?: string;
  currency?: ICurrency;
  currencyId?: string;
  gift?: number;

}

export interface IAccountAll {
  id: string;
  balance: number;
  customer: IUserAll;
  currency: ICurrencyAll;
  currencies?: ICurrencyAll[];
}

export interface IPaymentRequest {
  type?: PaymentType;
  bic?: string;
  ipAddress?: string;
  paymentOptionId?: number;
  transfer?: string;
  preferenceId?: string;
}

export interface IAccountTransaction {
  account?: IAccountAll;
  transactions?: Pagination<ITransaction>;
}
export interface ITransaction {
  account?: IAccountAll;
  accountId?: string;
  id?: string;
  deleted?: boolean;
  amount?: number;
  amountGifted?: number;
  paymentLink?: string;
  payment?: IPayment;
  paymentRequest?: IPaymentRequest;
  createdAt?: string;
  // Account add mode
  customerId?: string;
  currencyId?: string;
  gift?: number;

}

export class Transaction implements ITransaction {
  constructor() {
  }
}
