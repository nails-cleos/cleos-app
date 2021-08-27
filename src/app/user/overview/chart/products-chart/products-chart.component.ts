import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { IReservationAll } from '../../../../interfaces/reservation';
import { chartArrayColors, defaultOptions, productChart } from '../../../../util/chart';

@Component({
  selector: 'app-products-chart',
  templateUrl: './products-chart.component.html',
  styleUrls: ['./products-chart.component.scss']
})
export class ProductsChartComponent implements OnChanges {
  @Input() state: any;

  data: IReservationAll[] | undefined;
  error: any;

  public pieChartOptions: ChartOptions = defaultOptions();
  public pieChartLabels: Label[] = [];
  public pieChartData: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  public pieChartColors: Color[] = chartArrayColors();

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createChart();
  }

  private createChart(): void {
    if (this.state && ((this.state.data && this.state.data.reservations) || this.state.errorMessage)) {
      const chartResult = productChart(this.state.data.reservations);
      if (this.state.errorMessage || !chartResult) {
        this.error = {status: 'NO_CONTENT'};
        return;
      }
      this.pieChartData = chartResult.chartData;
      this.pieChartLabels = chartResult.chartLabels;
    }
  }
}
