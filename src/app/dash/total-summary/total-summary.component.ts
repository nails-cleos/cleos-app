import { Component, Input } from '@angular/core';
import { ITotal } from '../../interfaces/dashboard';
import { ICurrencyAll } from '../../interfaces/currency';

@Component({
  selector: 'app-total-summary',
  templateUrl: './total-summary.component.html',
  styleUrls: ['./total-summary.component.scss']
})
export class TotalSummaryComponent {
  @Input() income!: ITotal;
  @Input() expense!: ITotal;
  @Input() cash!: ITotal;
  @Input() totals!: ITotal;
  @Input() currency!: ICurrencyAll;
}
