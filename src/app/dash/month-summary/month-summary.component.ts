import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, UntypedFormControl } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';

import { dateMonthYear, getDateFormat, getDateQuarter, getNow, getWeeksInMonth, monthViewTitle, newDateTimestamp } from '../../util/dates';
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
  IMonthlySummarySale,
  ISummaryRoom,
  ISummaryTotal,
  SummaryType
} from '../../interfaces/dashboard';
import { YearMonthAdapter } from '../../util/adapter/year-month.adapter';
import { allElementsHaveSameKeyFilterValue, currencySymbol, titleCase } from '../../util/helper';
import { Router } from '@angular/router';
import { AuthUserService } from '../../services/auth-user.service';
import { ICurrencyAll } from '../../interfaces/currency';
import fs from 'file-saver';
import { createMonthlyExpenseWorkbook, createMonthlyIncomeWorkbook, createMonthlySummary } from '../../util/report';

@Component({
  selector: 'app-month-summary',
  templateUrl: './month-summary.component.html',
  styleUrls: ['./month-summary.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: YearMonthAdapter }
  ]
})
export class MonthSummaryComponent implements OnInit, OnDestroy {
  date = new FormControl<Date | null>(null);
  monthlySummaryMap?: Map<ISummaryRoom, {
    summarySale: IMonthlySummarySale[];
    summaryExpenses: IMonthlySummaryExpense[];
    summaryCashSale: IMonthlySummarySale[];
  }>;
  selectedRoom = new UntypedFormControl();
  amountFormat = new UntypedFormControl('ES');
  amountFormatKeys = Object.values(AmountFormat);
  summaryReservations?: IMonthlySummary[];
  summaryExpenses?: IMonthlySummary[];
  summaryCash?: IMonthlySummary[];
  weeks: any[];
  dateFormat: string;
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
  primaryRoom?: ISummaryRoom;
  currency: ICurrencyAll = { id: '', name: 'euro', code: 'EUR', icon: 'euro' };
  timeZone?: string;
  showCash: boolean;
  readonly language: string;

  private getState: Observable<any>;
  private subscription: Subscription;
  private readonly extras: any;
  private userName?: string;

  constructor(private readonly translate: TranslateService, private store: Store<AppState>, private router: Router,
              private authUserService: AuthUserService) {
    this.showCash = false;
    this.getState = this.store.select(selectDashboardState);
    this.dateFormat = this.translate.currentLang;
    this.language = this.translate.currentLang;
    this.weeks = getWeeksInMonth(getNow());
    this.extras = this.router.getCurrentNavigation()?.extras.state;
    this.subscription = this.authUserService.authUser.subscribe(value => {
      this.userName = value.displayName;
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
      this.router.navigate([this.language, 'dashboard', 'quarter', 'summary'], { state: { year, quarter } });
    } else {
      this.router.navigate([this.language, 'dashboard', 'quarter', 'summary']);
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
      const dateTime = this.extras.date;
      let month;
      let year;
      if (dateTime instanceof Date) {
        month = dateTime.getMonth();
        year = dateTime.getFullYear();
      } else {
        const date = dateTime.split('-');
        month = Number(date[0]) - 1;
        year = date[1];
      }
      this.date.setValue(dateMonthYear(month, year));
    } else {
      this.date.setValue(getNow());
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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

  exportMonthlySummary(): void {
    const workbook = createMonthlySummary(this.weeks, currencySymbol(this.currency), this.translate, this.timeZone,
      this.summaryReservations as IMonthlySummarySale[], this.summaryExpenses as IMonthlySummaryExpense[]);

    workbook.creator = this.userName || '';
    workbook.created = getNow();

    // Generate & Save Excel File
    workbook.xlsx.writeBuffer().then((content) => {
      const blob = new Blob([content], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      fs.saveAs(blob, `Report_${ monthViewTitle(this.date.value || getNow()).replace(' ', '_') }.xlsx`);
    });
  }

  exportToExcel(type: SummaryType, title: string, data?: IMonthlySummary[]): void {
    if (data?.length) {
      const name = `${ titleCase(SummaryType[type]) }-${ getDateFormat(this.date.value) }`;

      let workbook;

      let gross;
      let btw;
      let values;
      switch (type) {
        case SummaryType.payment:
          gross = this.reservationGrossMonth;
          btw = this.reservationBtwMonth;
          values = this.monthlySummaryPayment;
          workbook = createMonthlyIncomeWorkbook(data as IMonthlySummarySale[], this.weeks,
            this.translate.instant(`SUMMARY.${ title }`), SummaryType[type], name, this.translate,
            currencySymbol(this.currency), this.timeZone);
          break;
        case SummaryType.expense:
          gross = this.expenseGrossMonth;
          btw = this.expenseBtwMonth;
          values = this.monthlySummaryExpense;
          workbook = createMonthlyExpenseWorkbook(data as IMonthlySummaryExpense[], this.weeks,
            this.translate.instant(`SUMMARY.${ title }`), name, this.translate,
            currencySymbol(this.currency), this.timeZone);
          break;
        case SummaryType.cash:
          gross = this.cashGrossMonth;
          btw = this.cashBtwMonth;
          values = this.monthlySummaryCash;
          workbook = createMonthlyIncomeWorkbook(data as IMonthlySummarySale[], this.weeks,
            this.translate.instant(`SUMMARY.${ title }`), SummaryType[type], name, this.translate,
            currencySymbol(this.currency), this.timeZone);
          break;
      }

      workbook.creator = this.userName || '';
      workbook.created = getNow();

      // Generate & Save Excel File
      workbook.xlsx.writeBuffer().then((content) => {
        const blob = new Blob([content], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        fs.saveAs(blob, `${ name }.xlsx`);
      });

      this.updateMonthlySummary(type, gross, btw, values);
    }
  }

  updateMonthlySummary(type: SummaryType, gross: number, btw: number, summaries: IMonthlySummaryRequest[]): void {
    this.isLoading = true;
    return this.store.dispatch(
      new fromActionsDashboard.UpdateMonthlySummary(
        {
          date: getDateFormat(this.date.value),
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
        this.getSummary(getDateFormat(value));
        this.weeks = getWeeksInMonth(value);
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

  private createData(): void {
    const room = this.selectedRoom.value;
    if (room) {
      let summary: {
        summarySale: IMonthlySummarySale[];
        summaryExpenses: IMonthlySummaryExpense[];
        summaryCashSale: IMonthlySummarySale[];
      } | undefined;
      if (room === 'All' && this.monthlySummaryMap && this.primaryRoom) {
        this.roomId = this.primaryRoom.roomId;
        this.currency = this.primaryRoom.currency;
        this.timeZone = this.primaryRoom.timeZone;
        summary = [...this.monthlySummaryMap.values()].reduce((prev, curr) => {
          prev.summarySale = prev.summarySale.concat(curr.summarySale);
          prev.summaryExpenses = prev.summaryExpenses.concat(curr.summaryExpenses);
          prev.summaryCashSale = prev.summaryCashSale.concat(curr.summaryCashSale);
          return prev;
        }, { summarySale: [], summaryExpenses: [], summaryCashSale: [] });
        summary.summarySale = summary.summarySale.sort((a, b) => a.timestamp - b.timestamp);
      } else {
        this.roomId = room.roomId;
        this.currency = room.currency;
        this.timeZone = room.timeZone;
        summary = this.monthlySummaryMap?.get(this.selectedRoom.value);
      }
      this.summaryReservations = summary?.summarySale.map((s, i) => {
        if (s.id) {
          const reservationDate = newDateTimestamp(s.timestamp);
          return Object.assign({}, s, { reservationDate, day: reservationDate.getDate(), position: i });
        }
        return s;
      });
      this.calculateReservationSummary();

      this.summaryExpenses = summary?.summaryExpenses.map((s, i) => {
        if (s.id) {
          const expenseDate = newDateTimestamp(s.timestamp);
          return Object.assign({}, s, { expenseDate, day: expenseDate.getDate(), position: i });
        }
        return s;
      });
      this.calculateExpenseSummary();

      this.summaryCash = summary?.summaryCashSale.map((s, i) => {
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

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.monthlySummaryMap = state.monthlySummaryMap;
      this.monthlySummaryMap?.forEach((value, key) => {
        this.monthlySummaryMap?.set(key, {
          summarySale: value.summarySale.map(s => {
            if (s?.paths) {
              return Object.assign({}, s, { paths: `/${ this.language }/${ s.paths.join('/') }` });
            }
            return s;
          }),
          summaryExpenses: value.summaryExpenses.map(s => {
            if (s?.paths) {
              return Object.assign({}, s, { paths: `/${ this.language }/${ s.paths.join('/') }` });
            }
            return s;
          }),
          summaryCashSale: value.summaryCashSale.map(s => {
            if (s?.paths) {
              return Object.assign({}, s, { paths: `/${ this.language }/${ s.paths.join('/') }` });
            }
            return s;
          })
        });
      });
      if (this.monthlySummaryMap) {
        if (this.monthlySummaryMap.size === 1) {
          this.selectedRoom.setValue(this.monthlySummaryMap.keys().next().value);
        } else {
          this.monthlySummaryMap.forEach((_, key) => {
            if (key.primary) {
              this.selectedRoom.setValue(key);
            }
          });
          if (this.monthlySummaryMap.size > 1 && allElementsHaveSameKeyFilterValue(this.monthlySummaryMap, ['currency', 'id'])) {
            this.primaryRoom = this.selectedRoom.value;
          }
        }
        this.isLoading = false;
      }
    });
  }
}
