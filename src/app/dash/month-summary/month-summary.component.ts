import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, UntypedFormControl } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';

import {
  dateMonthYear,
  getDateFormat,
  getDateQuarter,
  getNowTimeZone,
  getWeeksInMonth,
  monthViewTitle,
  newDateTimestamp
} from '../../util/dates';
import { Observable, Subscription } from 'rxjs';
import { AppState, selectDashboardState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as fromActionsDashboard from '../../store/dashboard.actions';
import {
  AmountFormat,
  ExpenseType,
  IMonthlySummary,
  IMonthlySummaryExpense,
  IMonthlySummaryRequest,
  IMonthlySummarySale,
  ISummaryRoom,
  ISummaryTotal,
  ITotalType,
  SummaryType,
  TotalType
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
  reservationMonth: ITotalType = new TotalType(SummaryType.payment);
  expenseMonth: ITotalType = new TotalType(SummaryType.expense, Object.values(ExpenseType));
  cashMonth: ITotalType = new TotalType(SummaryType.cash);

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
    this.weeks = getWeeksInMonth(getNowTimeZone(this.timeZone));
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

  private static groupSummary(summaries?: IMonthlySummary[]): Map<string, IMonthlySummary[]> {
    return summaries?.reduce((grouped: Map<string, IMonthlySummary[]>, item: IMonthlySummary) => {
      const length = item.total.payments.length;
      if (length) {
        item.total.payments.forEach(total => {
          const key = total.expenseType;
          const group = grouped.get(key) || [];
          const newItem = { ...item };
          newItem.total = {
            ...newItem.total,
            gross: total.gross,
            btw: total.btw,
            net: total.net,
            payments: []
          };
          group.push(newItem);
          grouped.set(key, group);
        });
      } else {
        const key = item.total.expenseType;
        const group = grouped.get(key) || [];
        group.push(item);
        grouped.set(key, group);
      }
      return grouped;
    }, new Map()) || new Map();
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

  private static addSummary(id: string, gross: number, btw: number,
                            summaries: IMonthlySummaryRequest[]): IMonthlySummaryRequest[] {
    const newSummary = { id, gross, btw };
    const exist = summaries.find(ms => ms.id === id);
    if (exist) {
      return summaries.map(u => u.id !== newSummary.id ? u : newSummary);
    }
    return [...summaries, newSummary];
  }

  private static newSummary(summary: IMonthlySummary, newSummaries: IMonthlySummaryRequest[], id: string,
                            gross: number = 0,
                            net: number = 0, btw: number = 0): {
    monthlySummary: IMonthlySummary;
    newSummaries: IMonthlySummaryRequest[]
  } {
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
      return {
        monthlySummary: Object.assign({}, summary, { total: { ...summary.total, gross, net, btw } }),
        newSummaries
      };
    }
  }

  private static parseValue(total: ISummaryTotal, key: 'btw' | 'gross' | 'net', id?: string): number {
    if (id) {
      const t = total.payments?.find(payment => payment.id === id);
      if (t) {
        return t[key] >= 0 ? t[key] : total[key];
      }
      return total[key];
    }
    return total[key];

  }

  private static updateAmounts(summaries: IMonthlySummary[], summaryRequests: IMonthlySummaryRequest[],
                               input: HTMLInputElement,
                               index: number, id: string): {
    monthlySummaries: IMonthlySummary[];
    newSummaries: IMonthlySummaryRequest[]
  } {
    const objIndex = summaries.findIndex((obj => obj.position === index));
    const isInvalidInput = MonthSummaryComponent.isInvalidInput(input.value);
    const summary = summaries[objIndex];
    const total = summary.total;
    let gross = isInvalidInput ? this.parseValue(total, 'gross', id) : parseFloat(input.value);
    const btwCurrent = this.parseValue(total, 'btw', id);
    const netCurrent = this.parseValue(total, 'net', id);
    const btwPercentage = Math.round((btwCurrent / netCurrent) * 100);
    let net = gross;
    let btw = 0;
    if (input.id === 'grossInput') {
      net = gross * 100 / (btwPercentage + 100);
      btw = gross - net;
    } else if (input.id === 'netInput') {
      if (!isInvalidInput) {
        net = parseFloat(input.value);
        gross = net * ((btwPercentage / 100) + 1);
        btw = gross - net;
      }
    } else if (input.id === 'btwInput') {
      if (!isInvalidInput) {
        btw = parseFloat(input.value);
        net = btw * 100 / btwPercentage;
        gross = btw + net;
      }
    }
    const { monthlySummary, newSummaries } = MonthSummaryComponent.newSummary(summary, summaryRequests, id, gross, net,
      btw);

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
      this.date.setValue(getNowTimeZone(this.timeZone));
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

  getTotal(total: ITotalType, attribute: 'gross' | 'net' | 'btw'): number {
    let sum = 0;
    total.totals.forEach(value => sum += value[attribute]);

    return sum;
  }

  exportMonthlySummary(): void {
    const title = monthViewTitle(this.date.value || getNowTimeZone(this.timeZone));
    const workbook = createMonthlySummary(title, this.weeks, currencySymbol(this.currency), this.translate,
      this.timeZone,
      this.summaryReservations as IMonthlySummarySale[], this.summaryExpenses as IMonthlySummaryExpense[]);

    workbook.creator = this.userName || '';
    workbook.created = getNowTimeZone(this.timeZone);

    // Generate & Save Excel File
    workbook.xlsx.writeBuffer().then((content) => {
      const blob = new Blob([content], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      fs.saveAs(blob, `Report_${ title.replace(' ', '_') }.xlsx`);
    });
  }

  exportToExcel(title: string, totalTypes: ITotalType, values: IMonthlySummaryRequest[],
                data?: IMonthlySummary[]): void {
    if (data?.length) {
      const workbookName = `${ titleCase(SummaryType[totalTypes.type]) }-${ getDateFormat(this.date.value) }`;
      const name = this.translate.instant(`SUMMARY.${ title }`);

      let workbook;
      const header = monthViewTitle(this.date.value || getNowTimeZone(this.timeZone));

      switch (totalTypes.type) {
        case SummaryType.payment:
          workbook = createMonthlyIncomeWorkbook(header, data as IMonthlySummarySale[], this.weeks,
            name, SummaryType[totalTypes.type], workbookName, this.translate, currencySymbol(this.currency),
            this.timeZone);
          break;
        case SummaryType.expense:
          workbook = createMonthlyExpenseWorkbook(header, data as IMonthlySummaryExpense[], this.weeks,
            name, workbookName, this.translate, currencySymbol(this.currency), this.timeZone);
          break;
        case SummaryType.cash:
          workbook = createMonthlyIncomeWorkbook(header, data as IMonthlySummarySale[], this.weeks,
            name, SummaryType[totalTypes.type], workbookName, this.translate, currencySymbol(this.currency),
            this.timeZone);
          break;
      }

      workbook.creator = this.userName || '';
      workbook.created = getNowTimeZone(this.timeZone);

      // Generate & Save Excel File
      workbook.xlsx.writeBuffer().then((content) => {
        const blob = new Blob([content], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        fs.saveAs(blob, `${ workbookName }.xlsx`);
      });

      this.updateMonthlySummary(totalTypes, values);
    }
  }

  updateMonthlySummary(totalTypes: ITotalType, summaries: IMonthlySummaryRequest[]): void {
    this.isLoading = true;
    let totals;
    let size;
    switch (totalTypes.type) {
      case SummaryType.cash:
        totals = Array.from(totalTypes.totals.values());
        size = this.summaryCash?.length;
        break;
      case SummaryType.payment:
        totals = Array.from(totalTypes.totals.values());
        size = this.summaryReservations?.length;
        break;
      case SummaryType.expense:
        totals = Array.from(totalTypes.totals, ([key, value]) => ({
          expenseType: key,
          ...value
        }));
        size = this.summaryExpenses?.length;
        break;
    }
    return this.store.dispatch(
      new fromActionsDashboard.UpdateMonthlySummary(
        {
          date: getDateFormat(this.date.value),
          roomId: this.roomId,
          totals,
          type: totalTypes.type,
          summaries,
          step: this.step,
          size
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
    this.reservationMonth = new TotalType(SummaryType.payment);
    this.expenseMonth = new TotalType(SummaryType.expense, Object.values(ExpenseType));
    this.cashMonth = new TotalType(SummaryType.cash);
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
    this.reservationMonth = this.reservationMonth.reset();
    MonthSummaryComponent.groupSummary(this.summaryReservations)?.forEach((it, key) => {
      const { gross, net, btw } = MonthSummaryComponent.calculateTotals(it);
      this.reservationMonth = this.reservationMonth.withTotal(gross, net, btw, key);
    });
  }

  private calculateExpenseSummary(): void {
    this.expenseMonth = this.expenseMonth.reset(Object.values(ExpenseType));
    MonthSummaryComponent.groupSummary(this.summaryExpenses)?.forEach((it, key) => {
      const { gross, net, btw } = MonthSummaryComponent.calculateTotals(it);
      this.expenseMonth = this.expenseMonth.withTotal(gross, net, btw, key);
    });
  }

  private calculateCashSummary(): void {
    this.cashMonth = this.cashMonth.reset();
    MonthSummaryComponent.groupSummary(this.summaryCash)?.forEach((it, key) => {
      const { gross, net, btw } = MonthSummaryComponent.calculateTotals(it);
      this.cashMonth = this.cashMonth.withTotal(gross, net, btw, key);
    });
  }

  private getNewObject(s: IMonthlySummary): any {
    if (s?.paths) {
      const paths = Array.isArray(s.paths) ? `/${ this.language }/${ s.paths.join('/') }` : s.paths;
      return Object.assign({}, s, { paths });
    }
    return s;
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.monthlySummaryMap = state.monthlySummaryMap;
      this.monthlySummaryMap?.forEach((value, key) => {
        this.monthlySummaryMap?.set(key, {
          summarySale: value.summarySale.map(s => this.getNewObject(s)),
          summaryExpenses: value.summaryExpenses.map(s => this.getNewObject(s)),
          summaryCashSale: value.summaryCashSale.map(s => this.getNewObject(s))
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
          if (this.monthlySummaryMap.size > 1 &&
            allElementsHaveSameKeyFilterValue(this.monthlySummaryMap, ['currency', 'id'])) {
            this.primaryRoom = this.selectedRoom.value;
          }
        }
        this.isLoading = false;
      }
    });
  }
}
