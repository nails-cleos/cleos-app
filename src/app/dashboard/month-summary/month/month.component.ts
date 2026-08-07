import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { IMonthSummary, ISummaryTotal, Total } from '../../dashboard';
import { ICurrencyAll } from '@app/currency/currency';
import { TranslatePipe } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.scss'],
  imports: [TranslatePipe, CurrencyPipe, TranslatePipe, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthComponent {
  private readonly navigationService: NavigationService = inject(NavigationService);

  month = input.required<IMonthSummary>();
  year = input.required<number>();
  currency = input<ICurrencyAll>();
  showCash = input<boolean>(false);

  income?: ISummaryTotal;
  expense?: ISummaryTotal;
  cash?: ISummaryTotal;

  constructor() {
    effect(() => {
      const { income, expense, cash } = this.month().total.reduce((types: any, next: ISummaryTotal) => {
        switch (next.type) {
          case 'CASH':
            if (this.showCash()) {
              types.cash.gross += next.gross;
              types.cash.btw += next.btw;
              types.cash.net += next.net;
            }
            break;
          case 'INCOME':
            types.income.gross += next.gross;
            types.income.btw += next.btw;
            types.income.net += next.net;
            break;
          case 'EXPENSE':
            types.expense.gross += next.gross;
            types.expense.btw += next.btw;
            types.expense.net += next.net;
            break;
        }
        return types;
      }, { income: new Total(), expense: new Total(), cash: new Total() });
      this.income = income;
      this.expense = expense;
      this.cash = cash;
    });
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
    this.navigationService.navigate(['dashboard', 'monthly', 'summary'],
      { state: { date: `${ month }-${ this.year() }`, step } });
  };
}
