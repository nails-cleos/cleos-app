import { Component, Input } from '@angular/core';
import { IMonthSummary } from '../../../interfaces/dashboard';
import { ICurrencyAll } from '../../../interfaces/currency';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { dateMonthYear, monthTitle } from '../../../util/dates';

@Component({
  selector: 'app-quarter',
  templateUrl: './quarter.component.html',
  styleUrls: ['./quarter.component.scss']
})
export class QuarterComponent {
  @Input() monthSummaries?: IMonthSummary[];
  @Input() measure!: 'long' | 'short';
  @Input() year!: number;
  @Input() quarter!: number;
  @Input() currency?: ICurrencyAll;
  @Input() margin: boolean;
  @Input() showCash: boolean;

  dateFormat: string;
  private readonly language: string;

  constructor(private readonly translate: TranslateService, private router: Router) {
    this.dateFormat = this.translate.currentLang;
    this.language = this.translate.currentLang;
    this.margin = false;
    this.showCash = false;
  }

  getMonth = (month: number): string => monthTitle(dateMonthYear(month - 1, this.year), this.dateFormat, this.measure);

  goToQuarter = (quarter: number): void => {
    this.router.navigate([this.language, 'dashboard', 'quarter', 'summary'], { state: { year: this.year, quarter } });
  }

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
      { state: { date: `${ month }-${ this.year }`, step } });
  }
}
