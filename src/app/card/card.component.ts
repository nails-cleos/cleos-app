import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  AnnualReservation,
  CustomerReservation,
  LastMonthReservation,
  MonthlyReservation,
  ProductReservation,
  QuantityProduct
} from '../util/chart';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';

enum ChartTypeEnum {
  QUANTITY_PRODUCT,
  PRODUCT_RESERVATION,
  MONTHLY_RESERVATION,
  YEARLY_PRODUCT_PRICE,
  CUSTOMER_RESERVATION,
  LAST_MONTH_RESERVATION
}

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

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

  ngOnInit(): void {
  }

  onClick(): void {
    // @ts-ignore
    switch (ChartTypeEnum[this.type]) {
      case ChartTypeEnum.QUANTITY_PRODUCT.valueOf():
        const quantityProduct = QuantityProduct(this.data, this.label);
        this.setBarChart(quantityProduct);
        break;
      case ChartTypeEnum.PRODUCT_RESERVATION.valueOf():
        const productReservation = ProductReservation(this.data);
        if (productReservation) {
          this.chartDataSet = productReservation.chartDataSet;
          this.chartLabels = productReservation.chartLabels;
          this.chartType = 'radar';
        }
        break;
      case ChartTypeEnum.MONTHLY_RESERVATION.valueOf():
        const monthlyReservation = MonthlyReservation(this.data, this.locale);
        if (monthlyReservation) {
          this.chartData = monthlyReservation.chartData;
          this.chartLabels = monthlyReservation.chartLabels;
          this.chartType = 'pie';
        }
        break;
      case ChartTypeEnum.YEARLY_PRODUCT_PRICE.valueOf():
        const annualChart = AnnualReservation(this.data, this.locale, this.label);
        this.setLineChart(annualChart);
        break;
      case ChartTypeEnum.CUSTOMER_RESERVATION.valueOf():
        const customerChart = CustomerReservation(this.data, this.label);
        this.setBarChart(customerChart);
        break;
      case ChartTypeEnum.LAST_MONTH_RESERVATION.valueOf():
        const lastMonth = LastMonthReservation(this.data, this.locale, this.label);
        this.setLineChart(lastMonth);
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

  private setBarChart(barChart: any): void {
    if (barChart) {
      this.chartDataSet = barChart.chartDataSet;
      this.chartLabels = barChart.chartLabels;
      this.chartType = 'bar';
      this.chartColors = [
        {
          backgroundColor: 'rgba(103, 58, 183)'
        }
      ];
      this.chartOptions = {
        responsive: true,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      };
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

