import { ThemePalette } from '@angular/material/core';
import { ChartType } from 'chart.js';
import { EventColor } from 'calendar-utils';
import { IAvailability } from './room';

export interface IDashboard {
  timeZone?: string;
  roomName?: string;
  roomId?: string;
  professionalName?: string;
  professionalId?: string;
  calendarSummary?: ICalendarSummary;
  miniCardSummaries?: IReservationSummary[];
  chartSummaries?: IChart[];
  error?: any;
}

export interface IEventSummary {
  calendarSummary?: ICalendarSummary;
}

export interface IReservationSummary {
  title: string;
  value?: number;
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
}

export interface ICalendarUnavailable {
  unavailableId: string;
  title: string;
  start: number;
  end: number;
  duration?: string;
  repeat: string;
  allDay: boolean;
}

export interface IChart {
  title: string;
  type?: ChartType;
  labels?: any[];
  data?: any;
  dataSet?: any[];
  label?: string;
  options?: string;
  colors?: string;
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
