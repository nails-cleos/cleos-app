import { ThemePalette } from '@angular/material/core';
import { ChartType } from 'chart.js';
import { EventColor } from 'calendar-utils';
import { IAvailability } from './room';
import { ICurrency, ICurrencyAll } from './currency';
import { States } from './reservation';
import { DiscountType } from './discount';
import { PaymentType } from './payment';

export interface IDashboard {
  timeZone?: string;
  roomName?: string;
  roomId?: string;
  professionalName?: string;
  professionalId?: string;
  calendarSummary?: ICalendarSummary;
  miniCardSummaries?: IReservationSummary[];
  chartSummaries?: IChart[];
  currency?: ICurrency;
  error?: any;
}

export interface IEventSummary {
  calendarSummary?: ICalendarSummary;
}

export interface IReservationSummary {
  title: string;
  value?: number | string;
  increase?: boolean;
  color?: ThemePalette;
  percentValue?: number;
  icon?: string;
  currency?: boolean;
  error?: any;
}

export interface ICardSummary {
  miniCardSummaries?: IReservationSummary[];
  chartSummaries?: IChart[];
}

export interface ICalendarSummary {
  reservations: ICalendarReservations[];
  unavailable: ICalendarUnavailable[];
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
  expense
}

export enum AmountFormat {
  en = 'EN',
  es = 'ES'
}

export interface ISummaryTotal {
  id: string;
  paymentType: PaymentType;
  expenseType: string;
  type: string;
  net: number;
  btw: number;
  gross: number;
  discountType: DiscountType;
  discountValue: number;
  payments: ISummaryTotal[];
}

export interface IMonthlySummary {
  id: string;
  position: number;
  timestamp: number;
  total: ISummaryTotal;
}

export interface IMonthlySummaryReservation extends IMonthlySummary {
  state: States;
  reservationDate: Date;
  customerName: string;
  treatmentName: string;
  color: string;
}

export interface IMonthlySummaryExpense extends IMonthlySummary {
  expenseDate: Date;
  invoice: string;
  storeSupply: string;
}

export interface ISummaryRoom {
  roomId: string;
  roomName: string;
  currency: ICurrencyAll;
  timeZone: string;
}

export interface IMonthlySummaryRequest {
  id: string;
  gross: number;
  btw: number;
}

export interface IMonthlyRoomSummary extends ISummaryRoom {
  reservationSummary: IMonthlySummaryReservation[];
  expenseSummary: IMonthlySummaryExpense[];
}

export interface IYearRoomSummary extends ISummaryRoom {
  yearSummaries: IYearSummary[];
}

export interface IQuarterSummary {
  month: number;
  total: ISummaryTotal[];
  totalGross: number;
  totalNet: number;
  totalBTW: number;
}

export interface IYearSummary {
  quarter: number;
  summaries: IQuarterSummary[];
}

export class YearSummary implements IYearSummary {
  quarter: number;
  summaries: IQuarterSummary[];

  constructor(quarter: number, summaries: IQuarterSummary[]) {
    this.quarter = quarter;
    this.summaries = summaries;
  }
}

export class QuarterSummary implements IQuarterSummary {
  month: number;
  total: ISummaryTotal[];
  totalGross: number;
  totalNet: number;
  totalBTW: number;

  constructor(month: number, total: ISummaryTotal[]) {
    this.month = month;
    this.total = total;
    const { totalGross, totalNet, totalBTW } = total.reduce((totals: any, next: ISummaryTotal) => {
      const by = next.type === 'INCOME' ? 1 : -1;
      totals.totalGross += next.gross * by;
      totals.totalNet += next.net * by;
      totals.totalBTW += next.btw * by;

      return totals;
    }, { totalGross: 0, totalNet: 0, totalBTW: 0 });
    this.totalGross = totalGross;
    this.totalNet = totalNet;
    this.totalBTW = totalBTW;
  }
}
