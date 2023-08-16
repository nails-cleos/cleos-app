import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormControl } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';

import { dateMonthYear, getDateQuarter, getNow, getWeeksInMonth, monthViewTitle, newDateTimestamp } from '../../util/dates';
import { Observable, Subscription } from 'rxjs';
import { AppState, selectDashboardState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as fromActionsDashboard from '../../store/dashboard.actions';
import {
  AmountFormat,
  IMonthlySummary,
  IMonthlySummaryExpense,
  IMonthlySummaryRequest,
  IMonthlySummaryReservation,
  ISummaryRoom,
  ISummaryTotal,
  SummaryType
} from '../../interfaces/dashboard';
import { YearMonthAdapter } from '../../util/adapter/year-month.adapter';
import { titleCase } from '../../util/helper';
import { Router } from '@angular/router';
import { twoDigitNumber } from '../../util/numbers';
import { AuthUserService } from '../../services/auth-user.service';

@Component({
  selector: 'app-month-summary',
  templateUrl: './month-summary.component.html',
  styleUrls: ['./month-summary.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: YearMonthAdapter }
  ]
})
export class MonthSummaryComponent implements OnInit {
  date = new FormControl<Date | null>(null);
  monthlySummaryMap?: Map<ISummaryRoom, {
    summaryReservation: IMonthlySummaryReservation[];
    summaryExpenses: IMonthlySummaryExpense[];
    summaryCash: IMonthlySummaryReservation[];
  }>;
  selectedRoom = new UntypedFormControl();
  amountFormat = new UntypedFormControl('ES');
  amountFormatKeys = Object.values(AmountFormat);
  summaryReservations?: IMonthlySummary[];
  summaryExpenses?: IMonthlySummary[];
  summaryCash?: IMonthlySummary[];
  weeks: any[];
  dateFormat: string;
  showInput = true;
  reservationGrossMonth = 0;
  reservationNetMonth = 0;
  reservationBtwMonth = 0;
  expenseGrossMonth = 0;
  expenseNetMonth = 0;
  expenseBtwMonth = 0;
  cashGrossMonth = 0;
  cashNetMonth = 0;
  cashBtwMonth = 0;

  monthlySummaryPayment: IMonthlySummaryRequest[] = [];
  monthlySummaryExpense: IMonthlySummaryRequest[] = [];
  monthlySummaryCash: IMonthlySummaryRequest[] = [];
  type: typeof SummaryType = SummaryType;
  step = 0;
  roomId?: string;
  locale = 'es';
  isLoading = false;
  showCash: boolean;

  private getState: Observable<any>;
  private subscription?: Subscription;
  private readonly extras: any;

  constructor(private readonly translate: TranslateService, private store: Store<AppState>, private router: Router,
              private authUserService: AuthUserService) {
    this.showCash = false;
    this.getState = this.store.select(selectDashboardState);
    this.dateFormat = this.translate.currentLang;
    this.weeks = getWeeksInMonth(getNow());
    this.extras = this.router.getCurrentNavigation()?.extras.state;
    this.authUserService.authUser.subscribe(value => {
      this.showCash = value.showCash;
    });
  }

  get dateFormatted(): string {
    return this.date.value ? monthViewTitle(this.date.value, this.translate.currentLang) : '';
  }

  get goBack(): void {
    if (this.date.value) {
      const year = this.date.value.getFullYear();
      const quarter = getDateQuarter(this.date.value);
      this.router.navigate(['dashboard', 'quarter', 'summary'], { state: { year, quarter } });
    } else {
      this.router.navigate(['dashboard', 'quarter', 'summary']);
    }
    return;
  }

  private static calculateTotals(summaries?: IMonthlySummary[]): { gross: number; btw: number; net: number } {
    const t = summaries?.map(s => s.total).reduce((totals: any, next: ISummaryTotal) => {
      let gross;
      let net;
      let btw;
      if (next.payments?.length) {
        const paid = next.payments.reduce((payments: any, payment: ISummaryTotal) => {
          payments.gross += payment.gross;
          payments.net += payment.net;
          payments.btw += payment.btw;
          return payments;
        }, { gross: 0, net: 0, btw: 0 });
        gross = paid.gross;
        net = paid.net;
        btw = paid.btw;
      } else {
        gross = next.gross;
        net = next.net;
        btw = next.btw;
      }
      totals.gross += gross;
      totals.net += net;
      totals.btw += btw;
      return totals;
    }, { gross: 0, net: 0, btw: 0 });

    return { gross: t?.gross || 0, net: t?.net || 0, btw: t?.btw || 0 };
  }

  private static cleanCVSText = (text: string): string => `${ text.replace(/,/g, '') }; `;

  private static getDateFormat(date: Date | null): string {
    if (!date) {
      return '';
    }
    const month = `0${ date.getMonth() + 1 }`.slice(0, 2);
    const year = date.getFullYear();

    return `${ month }-${ year }`;
  }

  private static isInvalidInput(value: string): boolean {
    return !value || new RegExp(/^0\.?0{0,2}$/g).test(value) || new RegExp(/^\.0{0,2}$/g).test(value);
  }

  private static getType = (key: string): SummaryType => SummaryType[key.toLowerCase() as keyof typeof SummaryType];

  private static addSummary(id: string, gross: number, btw: number, summaries: IMonthlySummaryRequest[]): IMonthlySummaryRequest[] {
    const newSummary = { id, gross, btw };
    const exist = summaries.find(ms => ms.id === id);
    if (exist) {
      return summaries.map(u => u.id !== newSummary.id ? u : newSummary);
    }
    return [...summaries, newSummary];
  }

  private static newSummary(summary: IMonthlySummary, newSummaries: IMonthlySummaryRequest[], id: string, gross: number = 0,
                            net: number = 0, btw: number = 0): { monthlySummary: IMonthlySummary; newSummaries: IMonthlySummaryRequest[] } {
    newSummaries = MonthSummaryComponent.addSummary(id, gross, btw, newSummaries);
    if (summary.total.payments?.length) {
      const objIndex = summary.total.payments?.findIndex((obj => obj.id === id));
      const payment = summary.total.payments[objIndex];

      const updatedObj = Object.assign({}, payment, { gross, net, btw });

      const payments = [
        ...summary.total.payments.slice(0, objIndex),
        updatedObj,
        ...summary.total.payments.slice(objIndex + 1),
      ];
      return { monthlySummary: Object.assign({}, summary, { total: { ...summary.total, payments } }), newSummaries };
    } else {
      return { monthlySummary: Object.assign({}, summary, { total: { ...summary.total, gross, net, btw } }), newSummaries };
    }
  }

  private static updateAmounts(summaries: IMonthlySummary[], summaryRequests: IMonthlySummaryRequest[], input: HTMLInputElement,
                               index: number, id: string): { monthlySummaries: IMonthlySummary[]; newSummaries: IMonthlySummaryRequest[] } {
    const objIndex = summaries.findIndex((obj => obj.position === index));
    const isInvalidInput = MonthSummaryComponent.isInvalidInput(input.value);
    const summary = summaries[objIndex];
    const total = summary.total;
    let gross = isInvalidInput ? id ?
        total.payments?.find(payment => payment.id === id)?.gross || total.gross
        : total.gross
      : parseFloat(input.value);
    let net = gross;
    let btw = 0;
    if (input.id === 'grossInput') {
      net = gross * 100 / 121;
      btw = gross - net;
    } else if (input.id === 'netInput') {
      if (!isInvalidInput) {
        net = parseFloat(input.value);
        gross = net * 1.21;
        btw = gross - net;
      }
    } else if (input.id === 'btwInput') {
      if (!isInvalidInput) {
        btw = parseFloat(input.value);
        net = btw * 100 / 21;
        gross = btw + net;
      }
    }
    const { monthlySummary, newSummaries } = MonthSummaryComponent.newSummary(summary, summaryRequests, id, gross, net, btw);

    const monthlySummaries = [
      ...summaries.slice(0, objIndex),
      monthlySummary,
      ...summaries.slice(objIndex + 1),
    ];

    return { monthlySummaries, newSummaries };
  }

  ngOnInit(): void {
    this.subscribe();
    this.valueChange();
    if (this.extras) {
      this.step = this.extras.step || 0;
      const date = this.extras.date.split('-');
      const month = Number(date[0]) - 1;
      const year = date[1];
      this.date.setValue(dateMonthYear(month, year));
    } else {
      this.date.setValue(getNow());
    }
  }

  setStep(index: number): void {
    this.step = index;
  }

  setMonthAndYear(normalizedMonthAndYear: Date, datepicker: MatDatepicker<Date>): void {
    const ctrlValue = this.date.value;
    ctrlValue?.setMonth(normalizedMonthAndYear.getMonth());
    ctrlValue?.setFullYear(normalizedMonthAndYear.getFullYear());

    this.date.setValue(ctrlValue);

    datepicker.close();
  }

  twoDigit(input: HTMLInputElement, index: number, key: string, id: string): void {
    const type = MonthSummaryComponent.getType(key);
    switch (type) {
      case SummaryType.payment:
        if (this.summaryReservations) {
          this.setSummaryReservation(input, index, id);
        }
        this.calculateReservationSummary();
        break;
      case SummaryType.expense:
        if (this.summaryExpenses) {
          this.setSummaryExpense(input, index, id);
        }
        this.calculateExpenseSummary();
        break;
      case SummaryType.cash:
        if (this.summaryCash) {
          this.setSummaryCash(input, index, id);
        }
        this.calculateCashSummary();
        break;
    }
  }

  exportCVS(table: HTMLTableElement, type: SummaryType): void {
    this.showInput = false;

    setTimeout(() => {
      let csv = '';

      const th = table.children[1].children[0]; // start in 1 to exclude col

      for (const thChildren of Array.from(th.children).slice(1, th.children.length)) {
        // @ts-ignore
        csv += MonthSummaryComponent.cleanCVSText(thChildren.innerText);
      }

      csv = `${ csv.substring(0, csv.length - 2) }\n`;

      for (const tbody of Array.from(table.children).slice(2, table.children.length - 1)) {
        // @ts-ignore
        for (const trBody of tbody.children) {
          let remove = false;
          for (const tdBody of Array.from(trBody.children).slice(1, trBody.children.length)) {
            // @ts-ignore
            csv += `${ tdBody.innerText }; `;
            remove = true;
          }
          if (remove) {
            csv = `${ csv.substring(0, csv.length - 2) }\n`;
          }
        }
      }

      let gross;
      let net;
      let btw;
      let values;
      switch (type) {
        case SummaryType.payment:
          gross = this.reservationGrossMonth;
          net = this.reservationNetMonth;
          btw = this.reservationBtwMonth;
          values = this.monthlySummaryPayment;
          break;
        case SummaryType.expense:
          gross = this.expenseGrossMonth;
          net = this.expenseNetMonth;
          btw = this.expenseBtwMonth;
          values = this.monthlySummaryExpense;
          break;
        case SummaryType.cash:
          gross = this.cashGrossMonth;
          net = this.cashNetMonth;
          btw = this.cashBtwMonth;
          values = this.monthlySummaryCash;
          break;
      }
      csv += ';;;;;';
      csv += `${ twoDigitNumber(gross, this.locale) };${ twoDigitNumber(net, this.locale) };${ twoDigitNumber(btw, this.locale) }\n`;

      const hiddenElement = document.createElement('a');
      hiddenElement.href = `data:text/csv;charset=utf-8,${ encodeURI(csv) }`;
      hiddenElement.target = '_blank';
      hiddenElement.download = `${ titleCase(SummaryType[type]) }-${ MonthSummaryComponent.getDateFormat(this.date.value) }.csv`;
      hiddenElement.click();

      return this.updateMonthlySummary(type, gross, btw, values);
    }, 100);
    return;
  }

  updateMonthlySummary(type: SummaryType, gross: number, btw: number, summaries: IMonthlySummaryRequest[]): void {
    this.isLoading = true;
    return this.store.dispatch(
      new fromActionsDashboard.UpdateMonthlySummary(
        {
          date: MonthSummaryComponent.getDateFormat(this.date.value),
          roomId: this.roomId,
          type,
          gross,
          btw,
          summaries,
          step: this.step
        }
      )
    );
  }

  private setSummaryReservation(input: HTMLInputElement, index: number, id: string): void {
    if (this.summaryReservations) {
      const {
        monthlySummaries,
        newSummaries
      } = MonthSummaryComponent.updateAmounts(this.summaryReservations, this.monthlySummaryPayment, input, index, id);
      this.summaryReservations = monthlySummaries;
      this.monthlySummaryPayment = newSummaries;
    }
  }

  private setSummaryExpense(input: HTMLInputElement, index: number, id: string): void {
    if (this.summaryExpenses) {
      const {
        monthlySummaries,
        newSummaries
      } = MonthSummaryComponent.updateAmounts(this.summaryExpenses, this.monthlySummaryExpense, input, index, id);
      this.summaryExpenses = monthlySummaries;
      this.monthlySummaryExpense = newSummaries;
    }
  }

  private setSummaryCash(input: HTMLInputElement, index: number, id: string): void {
    if (this.summaryCash) {
      const {
        monthlySummaries,
        newSummaries
      } = MonthSummaryComponent.updateAmounts(this.summaryCash, this.monthlySummaryCash, input, index, id);
      this.summaryCash = monthlySummaries;
      this.monthlySummaryCash = newSummaries;
    }
  }

  private valueChange(): void {
    this.selectedRoom.valueChanges.subscribe(value => {
      if (value) {
        this.createData();
      }
    });
    this.date.valueChanges.subscribe(value => {
      if (value) {
        this.getSummary(MonthSummaryComponent.getDateFormat(value));
        this.weeks = getWeeksInMonth(value);
        this.showInput = true;
      }
    });
    this.amountFormat.valueChanges.subscribe(format => {
      if (format) {
        this.locale = format.toLowerCase();
      }
    });
  }

  private getSummary(date: string): void {
    this.isLoading = true;
    this.summaryReservations = undefined;
    this.summaryExpenses = undefined;
    this.summaryCash = undefined;
    this.store.dispatch(
      new fromActionsDashboard.GetMonthlySummary(date)
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.monthlySummaryMap = state.monthlySummaryMap;
      if (this.monthlySummaryMap) {
        this.isLoading = false;
        if (this.monthlySummaryMap.size === 1) {
          const [room] = this.monthlySummaryMap.keys();
          this.selectedRoom.setValue(room);
        }
      }
    });
  }

  private createData(): void {
    if (this.selectedRoom.value) {
      this.roomId = this.selectedRoom.value.roomId;
      this.summaryReservations = this.monthlySummaryMap?.get(this.selectedRoom.value)?.summaryReservation.map((s, i) => {
        if (s.id) {
          const reservationDate = newDateTimestamp(s.timestamp);
          return Object.assign({}, s, { reservationDate, day: reservationDate.getDate(), position: i });
        }
        return s;
      });
      this.calculateReservationSummary();

      this.summaryExpenses = this.monthlySummaryMap?.get(this.selectedRoom.value)?.summaryExpenses.map((s, i) => {
        if (s.id) {
          const expenseDate = newDateTimestamp(s.timestamp);
          return Object.assign({}, s, { expenseDate, day: expenseDate.getDate(), position: i });
        }
        return s;
      });
      this.calculateExpenseSummary();

      this.summaryCash = this.monthlySummaryMap?.get(this.selectedRoom.value)?.summaryCash.map((s, i) => {
        if (s.id) {
          const reservationDate = newDateTimestamp(s.timestamp);
          return Object.assign({}, s, { reservationDate, day: reservationDate.getDate(), position: i });
        }
        return s;
      });
      this.calculateCashSummary();
    }
  }

  private calculateReservationSummary(): void {
    const { gross, net, btw } = MonthSummaryComponent.calculateTotals(this.summaryReservations);
    this.reservationGrossMonth = gross;
    this.reservationNetMonth = net;
    this.reservationBtwMonth = btw;
  }

  private calculateExpenseSummary(): void {
    const { gross, net, btw } = MonthSummaryComponent.calculateTotals(this.summaryExpenses);
    this.expenseGrossMonth = gross;
    this.expenseNetMonth = net;
    this.expenseBtwMonth = btw;
  }

  private calculateCashSummary(): void {
    const { gross, net, btw } = MonthSummaryComponent.calculateTotals(this.summaryCash);
    this.cashGrossMonth = gross;
    this.cashNetMonth = net;
    this.cashBtwMonth = btw;
  }
}
