import { ThemePalette } from '@angular/material/core';
import { ChartType } from 'chart.js';
import { EventColor } from 'calendar-utils';
import { IAvailability } from './room';
import { ICurrency, ICurrencyAll } from './currency';
import { States } from './reservation';
import { PaymentType } from './payment';
import { FrequencyEnum } from '../util/helper';

export interface IDashboard {
  timeZone?: string;
  roomName?: string;
  roomId?: string;
  primary?: boolean;
  all?: boolean;
  professionalName?: string;
  professionalId?: string;
  calendarSummary?: ICalendarSummary;
  miniCardSummaries?: IReservationSummary[];
  chartSummaries?: IChart[];
  currency?: ICurrency;
  error?: any;
  thisMonthTotal?: number;
}

export interface IEventSummary {
  calendarSummary?: ICalendarSummary;
}

export interface IReservationSummary {
  title: string;
  value?: number | string;
  previousPeriodValue?: number | string;
  isIncrease?: boolean;
  color?: ThemePalette;
  percentValue?: number;
  icon?: string;
  isCurrency?: boolean;
  error?: any;
}

export interface ICardSummary {
  miniCardSummaries?: IReservationSummary[];
  chartSummaries?: IChart[];
}

export interface ICalendarSummary {
  reservations: ICalendarReservations[];
  unavailable: ICalendarUnavailable[];
  birthdays: ICalendarBirthday[];
  notes: ICalendarNote[];
  transactions: ICalendarTransaction[];
}

export interface ICalendarReservations {
  reservationId: string;
  customerId: string;
  title: string;
  start: number;
  started: number;
  end: number;
  state: string;
  total: number;
}

export interface ICalendarUnavailable {
  unavailableId: string;
  title: string;
  start: number;
  end: string;
  duration?: string;
  repeat: string;
  allDay: boolean;
  type: string;
}

export interface ICalendarBirthday {
  userId: string;
  title: string;
  date: string;
}

export interface ICalendarNote {
  noteId: string;
  title: string;
  date: number;
  repeat: FrequencyEnum;
}

export interface ICalendarTransaction {
  accountId: string;
  transactionId: string;
  title: string;
  createdAt: string;
  total: number;
}

export interface IChart {
  title: string;
  type?: ChartType;
  labels?: any[];
  dataSet?: any[];
  label?: string;
  options?: string;
  colors?: string;
  sum?: boolean;
  currency?: ICurrency;
  footer?: string;
}

export interface IRoomEvents {
  availability: IAvailability;
  timeZone: string;
  roomId: string;
  roomName: string;
  professionals: IProfessionalEvent[];
  error?: any;
}

export interface IProfessionalEvent {
  id: string;
  name: string;
  imageUrl?: string;
  image?: any;
  lightColor?: string;
  darkColor?: string;
  calendarSummary: ICalendarSummary;
}

export class ColorEvent implements EventColor {
  primary: string;
  secondary: string;

  constructor(primary: string, secondary: string) {
    this.primary = primary;
    this.secondary = secondary;
  }
}

export enum SummaryType {
  payment,
  expense,
  cash
}

export enum ExpenseType {
  directCosts = 'DIRECT_COSTS',
  indirectCosts = 'INDIRECT_COSTS',
  otherExpenses = 'OTHER_EXPENSES'
}

export enum AmountFormat {
  en = 'EN',
  es = 'ES'
}

export interface ITotal {
  gross: number;
  net: number;
  btw: number;
  size: number;
}

export interface ITotalType {
  type: SummaryType;
  totals: Map<string, ITotal>;

  withTotal(gross: number, net: number, btw: number, size: number, subType?: string): ITotalType;

  reset(subTypes?: string[]): ITotalType;
}

export class TotalType implements ITotalType {
  type: SummaryType;
  totals: Map<string, ITotal>;

  constructor(type: SummaryType, subTypes: string[] = []) {
    this.type = type;
    this.totals = new Map();
    if (!subTypes.length) {
      subTypes = [type.toString()];
    }
    subTypes.forEach(it => {
      this.totals.set(it, new Total());
    });
  }

  withTotal(gross: number, net: number, btw: number, size: number, subType?: string): ITotalType {
    const type = subType ?? this.type.toString();
    let total = this.totals.get(type);
    if (total) {
      total = new Total(gross, btw, net, size);
      this.totals.set(type, total);
    }
    return this;
  }

  reset(subTypes: string[] = []): ITotalType {
    if (!subTypes.length) {
      subTypes = [this.type.toString()];
    }
    subTypes.forEach(it => {
      this.totals.set(it, new Total());
    });
    return this;
  }

}

export interface ISummaryTotal extends ITotal {
  id: string;
  paymentType: PaymentType;
  expenseType: string;
  expenseSubType: string;
  type: string;
  description: string;
  discountDescription: string;
  discountValue: number;
  payments: ISummaryTotal[];
}

export interface IMonthlySummary {
  id: string;
  paths: string[];
  position: number;
  timestamp: number;
  total: ISummaryTotal;
  day: any;
  reservationTimestamp?: number;
}

export interface IMonthlySummarySale extends IMonthlySummary {
  state: States;
  reservationDate: Date;
  customerName: string;
  description: string;
  color: string;
}

export interface IMonthlySummaryExpense extends IMonthlySummary {
  expenseDate: Date;
  invoice: string;
  supplyStore: string;
}

export interface ISummaryRoom {
  roomId: string;
  roomName: string;
  currency: ICurrencyAll;
  timeZone: string;
  primary: boolean;
}

export interface IMonthlySummaryRequest {
  id: string;
  gross: number;
  btw: number;
}

export interface IMonthlyRoomSummary extends ISummaryRoom {
  saleSummary: IMonthlySummarySale[];
  expenseSummary: IMonthlySummaryExpense[];
  cashSaleSummary: IMonthlySummarySale[];
}

export interface IYearRoomExport extends ISummaryRoom {
  monthExportResponse: IMonthlyExport[];
}

export interface IMonthlyExport {
  month: number;
  saleSummary: IMonthlySummarySale[];
  expenseSummary: IMonthlySummaryExpense[];
  cashSaleSummary: IMonthlySummarySale[];
}

export interface IYearRoomSummary extends ISummaryRoom {
  quarterSummaries: IQuarterSummary[];
}

export interface IQuarterRoomSummary extends ISummaryRoom, IQuarterSummary {
}

export interface IMonthSummary {
  month: number;
  total: ISummaryTotal[];
  totalGross: number;
  totalNet: number;
  totalBTW: number;
  totalWithoutGross: number;
  totalWithoutNet: number;
  totalWithoutBTW: number;
}

export interface IQuarterSummary {
  quarter: number;
  monthSummaries: IMonthSummary[];
}

export class QuarterSummary implements IQuarterSummary {
  quarter: number;
  monthSummaries: IMonthSummary[];

  constructor(quarter: number, monthSummaries: IMonthSummary[]) {
    this.quarter = quarter;
    this.monthSummaries = monthSummaries;
  }
}

export class MonthSummary implements IMonthSummary {
  month: number;
  total: ISummaryTotal[];
  totalGross: number;
  totalNet: number;
  totalBTW: number;
  totalWithoutGross: number;
  totalWithoutNet: number;
  totalWithoutBTW: number;

  constructor(month: number, total: ISummaryTotal[]) {
    this.month = month;
    this.total = total;
    const {
      totalGross,
      totalNet,
      totalBTW,
      totalWithoutGross,
      totalWithoutNet,
      totalWithoutBTW
    } = total.reduce((totals: any, next: ISummaryTotal) => {
      const by = next.type === 'EXPENSE' ? -1 : 1;
      totals.totalGross += next.gross * by;
      totals.totalNet += next.net * by;
      totals.totalBTW += next.btw * by;

      if (next.type !== 'CASH') {
        totals.totalWithoutGross += next.gross * by;
        totals.totalWithoutNet += next.net * by;
        totals.totalWithoutBTW += next.btw * by;
      }

      return totals;
    }, { totalGross: 0, totalNet: 0, totalBTW: 0, totalWithoutGross: 0, totalWithoutNet: 0, totalWithoutBTW: 0 });
    this.totalGross = totalGross;
    this.totalNet = totalNet;
    this.totalBTW = totalBTW;
    this.totalWithoutGross = totalWithoutGross;
    this.totalWithoutNet = totalWithoutNet;
    this.totalWithoutBTW = totalWithoutBTW;
  }
}

export class Total implements ITotal {
  btw: number;
  gross: number;
  net: number;
  size: number;

  constructor(gross: number = 0, btw: number = 0, net: number = 0, size: number = 0) {
    this.btw = btw;
    this.gross = gross;
    this.net = net;
    this.size = size;
  }
}

export interface ISummaryTotals {
  income: ITotal;
  expense: ITotal;
  cash: ITotal;
  totalsWithoutCash: ITotal;
  totals: ITotal;
}

export class SummaryTotals implements ISummaryTotals {
  income: ITotal;
  expense: ITotal;
  cash: ITotal;
  totalsWithoutCash: ITotal;
  totals: ITotal;


  constructor(income: ITotal = new Total(), expense: ITotal = new Total(), cash: ITotal = new Total(),
              totalsWithoutCash: ITotal = new Total(), totals: ITotal = new Total()) {
    this.income = income;
    this.expense = expense;
    this.cash = cash;
    this.totalsWithoutCash = totalsWithoutCash;
    this.totals = totals;
  }
}
