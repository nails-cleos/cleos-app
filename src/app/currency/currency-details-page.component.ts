import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyComponent } from './currency.component';

@Component({
  selector: 'app-currency-details-page',
  template: '<app-currency [id]="id()" />',
  imports: [CurrencyComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyDetailsPageComponent {
  id = input<string>();
}
