import { Component, Input } from '@angular/core';
import { SharedModule } from "../../shared/shared.module";
import { ICurrencyAll } from "../../interfaces/currency";
import { TotalSummaryItemComponent } from "../total-summary-item/total-summary-item.component";

@Component({
  selector: 'app-result-summary',
  templateUrl: './result-summary.component.html',
  styleUrl: './result-summary.component.scss',
  standalone: true,
  imports: [SharedModule, TotalSummaryItemComponent],
})
export class ResultSummaryComponent {
  @Input() summaryTotals!: any;
  @Input() summaryType?: 'totals' | 'income' | 'expense' | 'cash';
  @Input() title!: string;
  @Input() currency?: ICurrencyAll;

  calculateAmount = (
    type: 'gross' | 'btw' | 'net'
  ): number => this.summaryType ? this.summaryTotals[this.summaryType][type] :
    this.summaryTotals.income[type] - this.summaryTotals.expense[type];
}
