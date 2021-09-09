import { IReservation, IReservationAll } from './reservation';
import { Pagination } from './pagination';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { SingleDataSet } from 'ng2-charts/lib/base-chart.directive';
import { Color } from 'ng2-charts/lib/color';
import { Label } from 'ng2-charts';

export interface IDash {
  data?: IReservationAll[] | null;
  page?: Pagination<IReservation> | null;
}

export interface IChart {
  chartLabels: Label[];
  chartDataSet: ChartDataSets[];
  chartData: SingleDataSet;
  chartType: ChartType;
  options: ChartOptions;
  colors: Color[];
  title: string;
}
