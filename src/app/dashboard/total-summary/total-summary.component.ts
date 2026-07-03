import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ISummaryTotals, ITotal } from '../dashboard';
import { ICurrencyAll } from '../../currency/currency';
import { TranslatePipe } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-total-summary',
  templateUrl: './total-summary.component.html',
  styleUrls: ['./total-summary.component.scss'],
  imports: [TranslatePipe, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalSummaryComponent {
  summaryTotals = input.required<ISummaryTotals>();
  currency = input<ICurrencyAll>();
  showCash = input<boolean>(false);

  primaryOperation = computed(() => {
    const totals = this.summaryTotals();
    return [
      { key: 'gross', label: 'SUMMARY.MONTHLY.TABLE.GROSS', left: totals.income, right: totals.expense, result: totals.totalsWithoutCash },
      { key: 'btw', label: 'SUMMARY.MONTHLY.TABLE.BTW', left: totals.income, right: totals.expense, result: totals.totalsWithoutCash },
      { key: 'net', label: 'SUMMARY.MONTHLY.TABLE.NET', left: totals.income, right: totals.expense, result: totals.totalsWithoutCash },
    ] as const;
  });

  cashOperation = computed(() => {
    const totals = this.summaryTotals();
    return [
      { key: 'gross', label: 'SUMMARY.MONTHLY.TABLE.GROSS', left: totals.totalsWithoutCash, right: totals.cash, result: totals.totals },
      { key: 'btw', label: 'SUMMARY.MONTHLY.TABLE.BTW', left: totals.totalsWithoutCash, right: totals.cash, result: totals.totals },
      { key: 'net', label: 'SUMMARY.MONTHLY.TABLE.NET', left: totals.totalsWithoutCash, right: totals.cash, result: totals.totals },
    ] as const;
  });

  valueOf = (total: ITotal, key: 'gross' | 'btw' | 'net'): number => total[key];
}
