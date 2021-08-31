import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import {
  annualReservationChart,
  barChartDefaultOptions,
  barChartTimeOptions,
  chartArrayColors,
  chartColors,
  customerReservationChart,
  defaultOptions,
  IChartUtil,
  lastMonthReservationChart,
  monthlyReservationChart,
  paymentChart,
  pieChartPercentageOptions,
  productChart,
  productReservationChart,
  quantityProductChart,
  trackingAverageChart,
  trackingCompareChart
} from '../../util/chart';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import { snakeToCamel } from '../../util/helper';
import { IChart } from '../../interfaces/dash';

enum ChartTypeEnum {
  quantityProduct,
  productReservation,
  monthlyReservation,
  yearlyProductPrice,
  customerReservation,
  lastMonthReservation,
  trackingAverage,
  trackingCompare,
  productOverview,
  paymentOverview
}

type ChartTypeKey = keyof typeof ChartTypeEnum;

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {

  @Input() title: string | undefined;
  @Input() type: string | undefined;
  @Input() label: any;
  @Input() data: any;
  @Input() expand = true;

  chartLabels: Label[] = [];
  chartDataSet: ChartDataSets[] | undefined;
  chartData: SingleDataSet | undefined;
  chartType: ChartType | undefined;
  chartOptions: ChartOptions = defaultOptions();
  chartColors: Color[] = chartColors();

  constructor(public translate: TranslateService, public dialog: MatDialog) {
  }

  onClick(): void {
    switch (ChartTypeEnum[snakeToCamel(this.type) as ChartTypeKey]) {
      case ChartTypeEnum.quantityProduct.valueOf():
        this.setChart('bar', quantityProductChart(this.data, this.label), barChartDefaultOptions());
        break;
      case ChartTypeEnum.trackingAverage.valueOf():
        this.setChart('bar', trackingAverageChart(this.data, this.label), barChartTimeOptions());
        break;
      case ChartTypeEnum.trackingCompare.valueOf():
        this.setChart('bar', trackingCompareChart(this.data, this.label), barChartTimeOptions());
        break;
      case ChartTypeEnum.customerReservation.valueOf():
        this.setChart('bar', customerReservationChart(this.data, this.label), barChartDefaultOptions());
        break;
      case ChartTypeEnum.monthlyReservation.valueOf():
        this.setChart('pie', monthlyReservationChart(this.data, this.translate.currentLang), defaultOptions(), chartArrayColors());
        break;
      case ChartTypeEnum.productOverview.valueOf():
        this.setChart('pie', productChart(this.data), defaultOptions(), chartArrayColors());
        break;
      case ChartTypeEnum.paymentOverview.valueOf():
        this.setChart('pie', paymentChart(this.data, this.translate), pieChartPercentageOptions(), chartArrayColors());
        break;
      case ChartTypeEnum.yearlyProductPrice.valueOf():
        this.setChart('line', annualReservationChart(this.data, this.translate.currentLang, this.label));
        break;
      case ChartTypeEnum.lastMonthReservation.valueOf():
        this.setChart('line', lastMonthReservationChart(this.data, this.translate.currentLang, this.label));
        break;
      case ChartTypeEnum.productReservation.valueOf():
        this.setChart('radar', productReservationChart(this.data));
        break;
    }
    if (this.chartType) {
      this.dialog.open(CardChartComponent, {
        height: '85vh',
        width: '70vw',
        data: {
          chartLabels: this.chartLabels,
          chartDataSet: this.chartDataSet,
          chartData: this.chartData,
          chartType: this.chartType,
          options: this.chartOptions,
          colors: this.chartColors,
          title: this.title
        }
      });
    }
  }

  private setChart(type: ChartType, chart: IChartUtil | null, options?: ChartOptions, color?: Color[]): void {
    if (chart) {
      this.chartDataSet = chart.chartDataSet;
      this.chartLabels = chart.chartLabels;
      this.chartData = chart.chartData;
      this.chartType = type;
      this.chartColors = color || this.chartColors;
      this.chartOptions = options || this.chartOptions;
    }
  }
}

@Component({
  selector: 'app-card-chart-component',
  templateUrl: './card-chart-component.html',
  styleUrls: ['./card-chart-component.scss']
})
export class CardChartComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IChart) {
  }
}

