import { ThemePalette } from '@angular/material/core';
import { ChartDataSets, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import { SingleDataSet } from 'ng2-charts/lib/base-chart.directive';


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
  reservations: ICalendarReservations;
  unavailable: ICalendarUnavailable;
}

export interface ICalendarReservations {
  reservationId: string;
  title: string;
  start: string;
  end: string;
  state: string;
}

export interface ICalendarUnavailable {
  unavailableId: string;
  title: string;
  start: string;
  end: string;
  duration?: string;
  repeat: string;
  allDay: boolean;
}

export interface IChart {
  title: string;
  type?: ChartType;
  labels?: Label[];
  data?: SingleDataSet;
  dataSet?: ChartDataSets[];
  label?: string;
  options?: string;
  colors?: string;
}
