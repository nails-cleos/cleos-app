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

export interface IMonthlySummaryTotal {
  paymentId: string;
  type: PaymentType;
  net: number;
  btw: number;
  gross: number;
  discountType: DiscountType;
  discountValue: number;
  payments: IMonthlySummaryTotal[];
}

export interface IMonthlySummaryReservation {
  id: string;
  position: number;
  state: States;
  timestamp: number;
  reservationDate: Date;
  customerName: string;
  treatmentName: string;
  color: string;
  total: IMonthlySummaryTotal;
}

export interface IMonthlyRoom {
  roomName: string;
  currency: ICurrencyAll;
  timeZone: string;
}

export interface IMonthlySummaryPayment {
  paymentId: string;
  gross: number;
  btw: number;
}

export interface IMonthlySummary extends IMonthlyRoom {
  reservationSummary: IMonthlySummaryReservation[];
}
