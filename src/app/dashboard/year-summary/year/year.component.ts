import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IMonthSummary, IQuarterSummary } from '../../dashboard';
import { ICurrencyAll } from '@app/currency/currency';
import { dateMonthYear, monthTitle } from '@app/util/dates';
import { MonthComponent } from '../../month-summary/month/month.component';
import { NavigationService } from '@app/services/navigation.service';

type YearMonthRow = {
  month: number;
  label: string;
  summary: IMonthSummary;
};

type YearQuarterRow = {
  quarter: number;
  months: YearMonthRow[];
};

@Component({
  selector: 'app-year',
  templateUrl: './year.component.html',
  styleUrls: ['./year.component.scss'],
  imports: [MonthComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YearComponent {
  private readonly navigationService: NavigationService = inject(NavigationService);

  year = input.required<number>();
  measure = input.required<'long' | 'short'>();
  quarterSummaries = input<IQuarterSummary[]>();
  currency = input<ICurrencyAll>();
  showCash = input<boolean>(false);

  private readonly language = this.navigationService.language;

  readonly quarterRows = computed<YearQuarterRow[]>(() => (this.quarterSummaries() ?? []).map((quarter) => ({
    quarter: quarter.quarter,
    months: quarter.monthSummaries.map((month) => ({
      month: month.month,
      label: monthTitle(dateMonthYear(month.month - 1, this.year()), this.language, this.measure()),
      summary: month,
    })),
  })));

  goToQuarter = (quarter: number): void => {
    this.navigationService.navigate(['dashboard', 'quarter', 'summary'],
      { state: { year: this.year(), quarter } });
  };

  goToMonth = (month: number): void => {
    this.navigationService.navigate(['dashboard', 'monthly', 'summary'],
      { state: { date: `${month}-${this.year()}` } });
  };
}
