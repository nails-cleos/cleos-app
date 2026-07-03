import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-total-summary-item',
  templateUrl: './total-summary-item.component.html',
  styleUrl: './total-summary-item.component.scss',
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalSummaryItemComponent {
  label = input.required<string>();
  value = input.required<number>();
  currencyCode = input<string>();
  isResult = input<boolean>(false);
}
