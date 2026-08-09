import { IUserAll } from '../user/user';
import { ICurrencyAll } from '../currency/currency';
import { IPayment } from '../interfaces/payment';
import { Pagination } from '../interfaces/pagination';
import { valueChange } from '../util/validators';
import { FormControl } from '@angular/forms';

export type BalanceForm = {
  currency: FormControl<ICurrencyAll | undefined>;
  gift: FormControl<number>;
};

export interface IAccountAll {
  id: string;
  balance: number;
  customer: IUserAll;
  currency: ICurrencyAll;
  currencies?: ICurrencyAll[];
  gift?: number;
}

export interface IPaymentRequest {
  type?: string;
  bic?: string;
  ipAddress?: string;
  paymentOptionId?: number | string;
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
  date?: Date;
  timestamp?: Date;
  // Account add mode
  customerId?: string;
  currencyId?: string;
  gift?: number;
}

export class Transaction {
  static fromForm(
    transactionForm: BalanceForm,
    customerId: string,
    currentAccount?: IAccountAll,
  ): ITransaction {
    return {
      customerId: customerId,
      currencyId: valueChange(
        transactionForm.currency.value,
        currentAccount?.currency,
      )?.id,
      gift: transactionForm.gift.value,
    };
  }
}
