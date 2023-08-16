import { AfterViewInit, Component, Input } from '@angular/core';
import { ISummaryTotals } from '../../interfaces/dashboard';
import { ICurrencyAll } from '../../interfaces/currency';

@Component({
  selector: 'app-total-summary',
  templateUrl: './total-summary.component.html',
  styleUrls: ['./total-summary.component.scss']
})
export class TotalSummaryComponent implements AfterViewInit {
  @Input() summaryTotals!: ISummaryTotals;
  @Input() currency!: ICurrencyAll;
  @Input() showCash: boolean;

  fxFlex: string;

  constructor() {
    this.showCash = false;
    this.fxFlex = '100%';
  }

  ngAfterViewInit(): void {
    if (this.showCash) {
      this.fxFlex = '50%';
    }
  }
}
