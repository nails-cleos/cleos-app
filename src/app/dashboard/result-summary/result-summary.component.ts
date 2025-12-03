import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ICurrencyAll } from '../../interfaces/currency';
import { TotalSummaryItemComponent } from '../total-summary-item/total-summary-item.component';
import { ISummaryTotals } from '../../interfaces/dashboard';

@Component({
  selector: 'app-result-summary',
  templateUrl: './result-summary.component.html',
  styleUrl: './result-summary.component.scss',
  imports: [SharedModule, TotalSummaryItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultSummaryComponent {
  summaryTotals = input.required<ISummaryTotals>();
  title = input.required<string>();
  summaryType = input<'totals' | 'income' | 'expense' | 'cash'>();
  currency = input<ICurrencyAll>();

  calculateAmount = (
    type: 'gross' | 'btw' | 'net',
  ): number => {
    const summaryTotals = this.summaryTotals();
    const summaryType = this.summaryType();
    return summaryType ? summaryTotals[summaryType][type] : summaryTotals.income[type] - summaryTotals.expense[type];
  };
}
