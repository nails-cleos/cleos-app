import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CurrencyComponent } from './currency.component';

@Component({
  selector: 'app-currency-create-page',
  template: '<app-currency />',
  imports: [CurrencyComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyCreatePageComponent {
}
