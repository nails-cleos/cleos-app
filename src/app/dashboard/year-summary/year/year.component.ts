import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IMonthSummary, IQuarterSummary } from '../../dashboard';
import { ICurrencyAll } from '../../../currency/currency';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { dateMonthYear, monthTitle } from '../../../util/dates';
import { MonthComponent } from '../../month-summary/month/month.component';

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
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly router: Router = inject(Router);

  year = input.required<number>();
  measure = input.required<'long' | 'short'>();
  quarterSummaries = input<IQuarterSummary[]>();
  currency = input<ICurrencyAll>();
  showCash = input<boolean>(false);

  private readonly language: string = this.translate.getCurrentLang();
  private readonly dateFormat: string = this.translate.getCurrentLang();

  readonly quarterRows = computed<YearQuarterRow[]>(() => (this.quarterSummaries() ?? []).map((quarter) => ({
    quarter: quarter.quarter,
    months: quarter.monthSummaries.map((month) => ({
      month: month.month,
      label: monthTitle(dateMonthYear(month.month - 1, this.year()), this.dateFormat, this.measure()),
      summary: month,
    })),
  })));

  goToQuarter = (quarter: number): void => {
    this.router.navigate([this.language, 'dashboard', 'quarter', 'summary'],
      { state: { year: this.year(), quarter } });
  };

  goToMonth = (month: number): void => {
    this.router.navigate([this.language, 'dashboard', 'monthly', 'summary'],
      { state: { date: `${month}-${this.year()}` } });
  };
}
