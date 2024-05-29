import { Component, Input } from '@angular/core';
import { ISummaryTotals } from '../../interfaces/dashboard';
import { ICurrencyAll } from '../../interfaces/currency';

@Component({
  selector: 'app-total-summary',
  templateUrl: './total-summary.component.html',
  styleUrls: ['./total-summary.component.scss']
})
export class TotalSummaryComponent {
  @Input() summaryTotals!: ISummaryTotals;
  @Input() currency?: ICurrencyAll;
  @Input() showCash: boolean;

  constructor() {
    this.showCash = false;
  }
}
