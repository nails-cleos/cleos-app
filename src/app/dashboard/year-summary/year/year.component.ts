import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IQuarterSummary } from '../../../interfaces/dashboard';
import { ICurrencyAll } from '../../../interfaces/currency';
import { QuarterComponent } from '../../quarter-summary/quarter/quarter.component';
import { AppMaterialModule } from '../../../util/app-material.module';

@Component({
  selector: 'app-year',
  templateUrl: './year.component.html',
  styleUrls: ['./year.component.scss'],
  imports: [AppMaterialModule, QuarterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YearComponent {
  year = input.required<number>();
  start = input.required<number>();
  measure = input.required<'long' | 'short'>();
  quarterSummaries = input<IQuarterSummary[]>();
  currency = input<ICurrencyAll>();
  showCash = input<boolean>(false);
}
