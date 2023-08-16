import { AfterViewInit, Component, Input } from '@angular/core';
import { IMonthSummary, ISummaryTotal, ITotal, Total } from '../../../interfaces/dashboard';
import { ICurrencyAll } from '../../../interfaces/currency';
import { Router } from '@angular/router';

@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.scss']
})
export class MonthComponent implements AfterViewInit {
  @Input() month!: IMonthSummary;
  @Input() currency!: ICurrencyAll;
  @Input() year!: number;
  @Input() showCash: boolean;

  income?: ISummaryTotal;
  expense?: ISummaryTotal;
  cash?: ISummaryTotal;

  constructor(private router: Router) {
    this.showCash = false;
  }

  ngAfterViewInit(): void {
    const { income, expense, cash } = this.month.total.reduce((types: any, next: ISummaryTotal) => {
      const total = new Total(next.gross, next.btw, next.net);
      switch (next.type) {
        case 'CASH':
          if (this.showCash) {
            types.cash = total;
          }
          break;
        case 'INCOME':
          types.income = total;
          break;
        case 'EXPENSE':
          types.expense = total;
          break;
      }
      return types;
    }, { income: {} as ITotal, expense: {} as ITotal, cash: {} as ITotal });
    this.income = income;
    this.expense = expense;
    this.cash = cash;
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
