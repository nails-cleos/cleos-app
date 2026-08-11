import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { CurrencyComponent } from './currency.component';
import { CurrencyStore } from '../store/currency.store';
import { ICurrency } from './currency';
import { ICommon } from '../interfaces/common';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';

@Component({
  selector: 'app-currency-details-page',
  template: `
    @if (currency(); as currency) {
      <app-currency
        [currency]="currency"
        [config]="config"
        (submitData)="submit($event)"
      />
    } @else {
      <app-skeleton />
    }
  `,
  imports: [CurrencyComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyDetailsPageComponent {
  id = input.required<string>();
  config: ICommon = {
    title: 'CURRENCY.DETAIL',
    button: { icon: 'published_with_changes', label: 'COMMON.BUTTON.UPDATE' },
  };

  private readonly currencyStore = inject(CurrencyStore);
  currency = computed(() => this.currencyStore.selected());

  constructor() {
    effect(() => {
      this.currencyStore.clean();
      this.currencyStore.loadById(this.id());
    });
  }

  submit(currency: ICurrency) {
    this.currencyStore.update(this.id(), currency);
  }
}
