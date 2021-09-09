import { ThemePalette } from '@angular/material/core';
import { ChartDataSets, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import { SingleDataSet } from 'ng2-charts/lib/base-chart.directive';


export interface IEventSummary {
  calendarSummaries?: ICalendarSummary[];
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
  chartSummaries?: IChartSummary[];
}

export interface ICalendarSummary {
  reservationId: string;
  title: string;
  start: string;
  end: string;
  state: string;
}

export interface IChartSummary {
  title: string;
  type?: ChartType;
  labels?: Label[];
  data?: SingleDataSet;
  dataSet?: ChartDataSets[];
  label?: string;
  options?: string;
  colors?: string;
}
