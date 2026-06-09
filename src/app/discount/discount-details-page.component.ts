import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { DiscountComponent } from './discount.component';
import { DiscountStore } from '../store/discount.store';
import { IDiscount } from './discount';
import { ICommon } from '../interfaces/common';
import { SkeletonComponent } from '../shared/skeleton.component';

@Component({
  selector: 'app-discount-details-page',
  template: `
    @if (discount(); as discount) {
      <app-discount [discount]="discount" [config]="config" (submitData)="submit($event)"/>
    } @else {
      <app-skeleton/>
    }
  `,
  imports: [DiscountComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountDetailsPageComponent {
  id = input.required<string>();
  config: ICommon = {
    title: 'DISCOUNT.DETAIL',
    button: { icon: 'published_with_changes', label: 'COMMON.BUTTON.UPDATE' },
  };

  private readonly discountStore = inject(DiscountStore);
  discount = computed(() => this.discountStore.selected());

  constructor() {
    effect(() => {
      this.discountStore.clean();
      this.discountStore.loadById(this.id());
    });
  }

  submit(discount: IDiscount) {
    this.discountStore.update(this.id(), discount);
  }
}
