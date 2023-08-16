import { Component, Input } from '@angular/core';
import { IQuarterSummary } from '../../../interfaces/dashboard';
import { ICurrencyAll } from '../../../interfaces/currency';

@Component({
  selector: 'app-year',
  templateUrl: './year.component.html',
  styleUrls: ['./year.component.scss']
})
export class YearComponent {
  @Input() quarterSummaries?: IQuarterSummary[];
  @Input() cols!: number;
  @Input() measure!: 'long' | 'short';
  @Input() year!: number;
  @Input() currency!: ICurrencyAll;
  @Input() start!: number;
  @Input() showCash: boolean;

  constructor() {
    this.showCash = false;
  }
}
