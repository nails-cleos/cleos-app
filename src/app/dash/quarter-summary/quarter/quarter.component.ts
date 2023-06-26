import { Component, Input } from '@angular/core';
import { IYearSummary } from '../../../interfaces/dashboard';
import { monthTitle } from '../../../util/dates';
import { TranslateService } from '@ngx-translate/core';
import { ICurrencyAll } from '../../../interfaces/currency';

@Component({
  selector: 'app-quarter',
  templateUrl: './quarter.component.html',
  styleUrls: ['./quarter.component.scss']
})
export class QuarterComponent {
  @Input() yearSummaries?: IYearSummary[];
  @Input() cols!: number;
  @Input() measure!: 'long' | 'short';
  @Input() year!: number;
  @Input() currency!: ICurrencyAll;

  dateFormat: string;

  constructor(private readonly translate: TranslateService) {
    this.dateFormat = this.translate.currentLang;
  }

  getMonth(month: number): string {
    return monthTitle(new Date(this.year, month - 1), this.dateFormat, this.measure);
  }
}
