import { FormControl } from '@angular/forms';
import { IUserAll } from '../user/user';
import { ICurrency } from '../currency/currency';
import { fieldChange } from '../util/validators';

export type DiscountForm = {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
  amount: FormControl<number>;
  type: FormControl<DiscountType | undefined>;
  currency: FormControl<ICurrency | undefined>;
};

export enum DiscountType {
  money = 'MONEY',
  percentage = 'PERCENTAGE',
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
  discount?: IDiscount;
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

export class Discount {
  static fromForm(
    discountForm: DiscountForm,
    currentDiscount?: IDiscountAll,
  ): IDiscount {
    return {
      name: fieldChange(discountForm.name, currentDiscount?.name),
      description: fieldChange(
        discountForm.description,
        currentDiscount?.description,
      ),
      type: fieldChange(discountForm.type, currentDiscount?.type),
      amount: fieldChange(discountForm.amount, currentDiscount?.amount),
      currencyId: discountForm.currency.value?.id,
    };
  }
}
