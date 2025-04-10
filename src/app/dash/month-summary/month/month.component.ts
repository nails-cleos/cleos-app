import { AfterViewInit, Component, Input } from '@angular/core';
import { IMonthSummary, ISummaryTotal, Total } from '../../../interfaces/dashboard';
import { ICurrencyAll } from '../../../interfaces/currency';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.scss'],
  imports: [SharedModule],
})
export class MonthComponent implements AfterViewInit {
  @Input() month!: IMonthSummary;
  @Input() currency?: ICurrencyAll;
  @Input() year!: number;
  @Input() showCash: boolean;

  income?: ISummaryTotal;
  expense?: ISummaryTotal;
  cash?: ISummaryTotal;
  private readonly language: string;

  constructor(private readonly translate: TranslateService, private router: Router) {
  	this.showCash = false;
  	this.language = this.translate.currentLang;
  }

  ngAfterViewInit(): void {
  	const { income, expense, cash } = this.month.total.reduce((types: any, next: ISummaryTotal) => {
  		switch (next.type) {
  		case 'CASH':
  			if (this.showCash) {
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
  	this.router.navigate([this.language, 'dashboard', 'monthly', 'summary'],
  		{ state: { date: `${ month }-${ this.year }`, step } });
  };
}
