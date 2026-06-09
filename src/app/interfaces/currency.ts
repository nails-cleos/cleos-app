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

export class Currency implements ICurrency {
  code?: string;
  name?: string;
  icon?: string;

  private constructor(currencyForm?: CurrencyForm) {
    if (!currencyForm) {
      return;
    }

    this.code = currencyForm.code.value;
    this.name = currencyForm.name.value;
    this.icon = currencyForm.icon.value;
  }

  static fromForm(currencyForm: CurrencyForm, currentCurrency?: ICurrencyAll): ICurrency {
    const currency = new Currency(currencyForm);
    currency.code = fieldChange(currencyForm.code, currentCurrency?.code);
    currency.name = fieldChange(currencyForm.name, currentCurrency?.name);
    currency.icon = fieldChange(currencyForm.icon, currentCurrency?.icon);

    return currency;
  }
}
