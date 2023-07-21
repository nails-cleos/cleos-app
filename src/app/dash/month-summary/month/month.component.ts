import { Component, Input } from '@angular/core';
import { IMonthSummary } from '../../../interfaces/dashboard';
import { ICurrencyAll } from '../../../interfaces/currency';
import { Router } from '@angular/router';

@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.scss']
})
export class MonthComponent {
  @Input() month!: IMonthSummary;
  @Input() currency!: ICurrencyAll;
  @Input() year!: number;

  constructor(private router: Router) {
  }

  goToMonth(month: number, type?: string): void {
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
    this.router.navigate(['dashboard', 'monthly', 'summary'], { state: { date: `${ month }-${ this.year }`, step } });
  }
}
