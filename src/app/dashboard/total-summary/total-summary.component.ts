import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ISummaryTotals } from '../../interfaces/dashboard';
import { ICurrencyAll } from '../../interfaces/currency';
import { SharedModule } from '../../shared/shared.module';
import { ResultSummaryComponent } from '../result-summary/result-summary.component';

@Component({
  selector: 'app-total-summary',
  templateUrl: './total-summary.component.html',
  styleUrls: ['./total-summary.component.scss'],
  imports: [SharedModule, ResultSummaryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalSummaryComponent {
  summaryTotals = input.required<ISummaryTotals>();
  currency = input<ICurrencyAll>();
  showCash = input<boolean>(false);
}
