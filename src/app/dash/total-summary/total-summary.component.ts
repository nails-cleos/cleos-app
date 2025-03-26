import { Component, Input } from '@angular/core';
import { ISummaryTotals } from '../../interfaces/dashboard';
import { ICurrencyAll } from '../../interfaces/currency';
import { SharedModule } from "../../shared/shared.module";
import { ResultSummaryComponent } from "../result-summary/result-summary.component";

@Component({
  selector: 'app-total-summary',
  templateUrl: './total-summary.component.html',
  styleUrls: ['./total-summary.component.scss'],
  standalone: true,
  imports: [SharedModule, ResultSummaryComponent]
})
export class TotalSummaryComponent {
  @Input() summaryTotals!: ISummaryTotals;
  @Input() currency?: ICurrencyAll;
  @Input() showCash: boolean;

  constructor() {
    this.showCash = false;
  }
}
