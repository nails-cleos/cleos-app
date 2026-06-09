import { FormControl } from '@angular/forms';
import { IUserAll } from './user';
import { ICurrency } from './currency';
import { fieldChange, valueChange } from '../util/validators';

export type DiscountForm = {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
  amount: FormControl<number>;
  type: FormControl<DiscountType | undefined>;
  currency: FormControl<ICurrency | undefined>;
};

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

export class Discount implements IDiscount {
  name?: string;
  description?: string;
  amount?: number;
  type?: string;
  currencyId?: string;

  private constructor(discountForm?: DiscountForm) {
    if (!discountForm) {
      return;
    }

    this.name = discountForm.name.value;
    this.description = discountForm.description.value;
    this.amount = discountForm.amount.value;
    this.type = discountForm.type.value;
    this.currencyId = discountForm.currency.value?.id;
  }

  static fromForm(discountForm: DiscountForm, currentDiscount?: IDiscountAll): IDiscount {
    const discount = new Discount(discountForm);
    discount.name = fieldChange(discountForm.name, currentDiscount?.name);
    discount.description = valueChange(discountForm.description.value, currentDiscount?.description);
    discount.type = fieldChange(discountForm.type, currentDiscount?.type);
    discount.amount = fieldChange(discountForm.amount, currentDiscount?.amount);
    discount.currencyId = discountForm.currency.value?.id;

    return discount;
  }
}
