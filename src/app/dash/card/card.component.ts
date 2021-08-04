import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import {
  annualReservationChart,
  barChartDefaultOptions,
  barChartTimeOptions,
  customerReservationChart,
  lastMonthReservationChart,
  monthlyReservationChart,
  productReservationChart,
  quantityProductChart,
  trackingAverageChart,
  trackingCompareChart
} from '../../util/chart';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import { snakeToCamel } from '../../util/helper';

enum ChartTypeEnum {
  quantityProduct,
  productReservation,
  monthlyReservation,
  yearlyProductPrice,
  customerReservation,
  lastMonthReservation,
  trackingAverage,
  trackingCompare
}

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

  locale: string;

  chartLabels: Label[] = [];
  chartDataSet: ChartDataSets[] | undefined;
  chartData: SingleDataSet | undefined;
  chartType: ChartType | undefined;
  chartOptions: ChartOptions = {
    responsive: true
  };
  chartColors: Color[] = [];

  constructor(public translate: TranslateService, public dialog: MatDialog) {
    const userLang = this.translate.currentLang;
    const index = userLang.indexOf('-');
    this.locale = index === -1 ? userLang : userLang.substr(0, index);
  }

  onClick(): void {
    // @ts-ignore
    switch (ChartTypeEnum[snakeToCamel(this.type)]) {
      case ChartTypeEnum.quantityProduct.valueOf():
        this.setBarChart(quantityProductChart(this.data, this.label), barChartDefaultOptions());
        break;
      case ChartTypeEnum.productReservation.valueOf():
        const product = productReservationChart(this.data);
        if (product) {
          this.chartDataSet = product.chartDataSet;
          this.chartLabels = product.chartLabels;
          this.chartType = 'radar';
        }
        break;
      case ChartTypeEnum.monthlyReservation.valueOf():
        const monthly = monthlyReservationChart(this.data, this.locale);
        if (monthly) {
          this.chartData = monthly.chartData;
          this.chartLabels = monthly.chartLabels;
          this.chartType = 'pie';
        }
        break;
      case ChartTypeEnum.yearlyProductPrice.valueOf():
        this.setLineChart(annualReservationChart(this.data, this.locale, this.label));
        break;
      case ChartTypeEnum.customerReservation.valueOf():
        this.setBarChart(customerReservationChart(this.data, this.label), barChartDefaultOptions());
        break;
      case ChartTypeEnum.lastMonthReservation.valueOf():
        this.setLineChart(lastMonthReservationChart(this.data, this.locale, this.label));
        break;
      case ChartTypeEnum.trackingAverage.valueOf():
        this.setBarChart(trackingAverageChart(this.data, this.label), barChartTimeOptions());
        break;
      case ChartTypeEnum.trackingCompare.valueOf():
        this.setBarChart(trackingCompareChart(this.data, this.label), barChartTimeOptions());
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

  private setLineChart(lineChart: any): void {
    if (lineChart) {
      this.chartDataSet = lineChart.chartDataSet;
      this.chartLabels = lineChart.chartLabels;
      this.chartType = 'line';
      this.chartColors = [
        {
          borderColor: 'rgb(103, 58, 183)',
          backgroundColor: 'rgba(103, 58, 183,0.3)'
        }
      ];
    }
  }

  private setBarChart(barChart: any, options: any): void {
    if (barChart) {
      this.chartDataSet = barChart.chartDataSet;
      this.chartLabels = barChart.chartLabels;
      this.chartType = 'bar';
      this.chartColors = [
        {
          backgroundColor: 'rgba(103, 58, 183)'
        }
      ];
      this.chartOptions = options;
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
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }
}

