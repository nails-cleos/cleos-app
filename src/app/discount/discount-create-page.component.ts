import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DiscountComponent } from './discount.component';
import { DiscountStore } from '../store/discount.store';
import { IDiscount } from './discount';
import { ICommon } from '../interfaces/common';

@Component({
  selector: 'app-discount-create-page',
  template: '<app-discount [currencies]="currencies()" [config]="config" (submitData)="submit($event)"/>',
  imports: [DiscountComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountCreatePageComponent {
  private readonly discountStore = inject(DiscountStore);
  config: ICommon = {
    title: 'DISCOUNT.TITLE',
    button: { icon: 'add', label: 'COMMON.BUTTON.CREATE' },
  };

  currencies = computed(() => this.discountStore.currencies());

  constructor() {
    this.discountStore.clean();
    this.discountStore.loadCurrencies();
  }

  submit(discount: IDiscount) {
    this.discountStore.create(discount);
  }
}
