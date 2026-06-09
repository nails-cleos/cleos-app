import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { IMonthSummary } from '../../dashboard';
import { ICurrencyAll } from '../../../currency/currency';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { dateMonthYear, monthTitle } from '../../../util/dates';
import { MonthComponent } from '../../month-summary/month/month.component';

@Component({
  selector: 'app-quarter',
  templateUrl: './quarter.component.html',
  styleUrls: ['./quarter.component.scss'],
  imports: [MonthComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuarterComponent {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly router: Router = inject(Router);

  measure = input.required<'long' | 'short'>();
  year = input.required<number>();
  quarter = input.required<number>();
  monthSummaries = input<IMonthSummary[]>([]);
  currency = input<ICurrencyAll>();
  margin = input<boolean>(false);
  showCash = input<boolean>(false);

  dateFormat: string = this.translate.getCurrentLang();
  private readonly language: string = this.translate.getCurrentLang();

  getMonth = (month: number): string => monthTitle(dateMonthYear(month - 1, this.year()), this.dateFormat,
    this.measure());

  goToQuarter = (): void => {
    this.router.navigate([this.language, 'dashboard', 'quarter', 'summary'],
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
    this.router.navigate([this.language, 'dashboard', 'monthly', 'summary'],
      { state: { date: `${month}-${this.year()}`, step } });
  };
}
