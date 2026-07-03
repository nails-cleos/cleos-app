import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { IMonthSummary } from '../../dashboard';
import { ICurrencyAll } from '../../../currency/currency';
import { dateMonthYear, monthTitle } from '../../../util/dates';
import { MonthComponent } from '../../month-summary/month/month.component';
import { NavigationService } from '../../../services/navigation.service';

@Component({
  selector: 'app-quarter',
  templateUrl: './quarter.component.html',
  styleUrls: ['./quarter.component.scss'],
  imports: [MonthComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuarterComponent {
  private readonly navigationService: NavigationService = inject(NavigationService);

  measure = input.required<'long' | 'short'>();
  year = input.required<number>();
  quarter = input.required<number>();
  monthSummaries = input<IMonthSummary[]>([]);
  currency = input<ICurrencyAll>();
  margin = input<boolean>(false);
  showCash = input<boolean>(false);

  private readonly language = this.navigationService.language;

  getMonth = (month: number): string => monthTitle(dateMonthYear(month - 1, this.year()), this.language,
    this.measure());

  goToQuarter = (): void => {
    this.navigationService.navigate(['dashboard', 'quarter', 'summary'],
      { state: { year: this.year(), quarter: this.quarter() } });
  };

  goToMonth = (month: number, type?: string): void => {
    let step = 0;
    switch (type) {
      case 'INCOME':
        step = 0;
        break;
      case 'EXPENSE':
        step = 1;
        break;
      case 'CASH':
        step = 2;
        break;
    }
    this.navigationService.navigate(['dashboard', 'monthly', 'summary'],
      { state: { date: `${ month }-${ this.year() }`, step } });
  };
}
