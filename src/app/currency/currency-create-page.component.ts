import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyComponent } from './currency.component';
import { CurrencyStore } from '../store/currency.store';
import { ICurrency } from './currency';
import { ICommon } from '../interfaces/common';

@Component({
  selector: 'app-currency-create-page',
  template: '<app-currency [config]="config" (submitData)="submit($event)"/>',
  imports: [CurrencyComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyCreatePageComponent {
  private readonly currencyStore = inject(CurrencyStore);
  config: ICommon = {
    title: 'CURRENCY.TITLE',
    button: { icon: 'add', label: 'COMMON.BUTTON.CREATE' },
  };

  submit(currency: ICurrency) {
    this.currencyStore.create(currency);
  }
}
