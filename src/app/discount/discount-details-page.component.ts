import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DiscountComponent } from './discount.component';

@Component({
  selector: 'app-discount-details-page',
  template: '<app-discount [id]="id()" />',
  imports: [DiscountComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountDetailsPageComponent {
  id = input<string>();
}
