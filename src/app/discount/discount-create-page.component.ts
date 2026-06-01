import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DiscountComponent } from './discount.component';

@Component({
  selector: 'app-discount-create-page',
  template: '<app-discount />',
  imports: [DiscountComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountCreatePageComponent {}
