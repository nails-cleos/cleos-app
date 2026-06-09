import { FormControl } from '@angular/forms';
import { fieldChange } from '../util/validators';

export type CurrencyForm = {
  code: FormControl<string>;
  name: FormControl<string | undefined>;
  icon: FormControl<string | undefined>;
};

export interface ICurrency {
  id?: string;
  name?: string;
  code?: string;
  icon?: string;
  deleted?: boolean;
}

export interface ICurrencyAll {
  id: string;
  name: string;
  code: string;
  icon: string;
}

export class Currency {
  static fromForm(
    currencyForm: CurrencyForm,
    currentCurrency?: ICurrencyAll,
  ): ICurrency {
    return {
      name: fieldChange(currencyForm.name, currentCurrency?.name),
      code: fieldChange(currencyForm.code, currentCurrency?.code),
      icon: fieldChange(currencyForm.icon, currentCurrency?.icon),
    };
  }
}
