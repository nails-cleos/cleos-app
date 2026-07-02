import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DiscountComponent } from './discount.component';
import { DiscountStore } from '../store/discount.store';
import { IDiscount } from './discount';
import { ICommon } from '../interfaces/common';
import { CurrencyStore } from '../store/currency.store';

@Component({
  selector: 'app-discount-create-page',
  template: '<app-discount [currencies]="currencies()" [config]="config" (submitData)="submit($event)"/>',
  imports: [DiscountComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountCreatePageComponent {
  private readonly discountStore = inject(DiscountStore);
  private readonly currencyStore = inject(CurrencyStore);
  config: ICommon = {
    title: 'DISCOUNT.TITLE',
    button: { icon: 'add', label: 'COMMON.BUTTON.CREATE' },
  };

  currencies= computed(() => {
    const data = this.currencyStore.data();
    return data?.kind === 'list' ? data.value : undefined;
  });


  constructor() {
    this.discountStore.clean();
    this.currencyStore.loadAll();
  }

  submit(discount: IDiscount) {
    this.discountStore.create(discount);
  }
}
