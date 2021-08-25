import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { IReservationAll } from '../../../interfaces/reservation';
import { chartColors, barChartDefaultOptions, customerReservationChart } from '../../../util/chart';

@Component({
  selector: 'app-customer-reservations-chart',
  templateUrl: './customer-reservations-chart.component.html',
  styleUrls: ['./customer-reservations-chart.component.scss']
})
export class CustomerReservationsChartComponent implements OnChanges {
  @Input() state: any;
  @Input() label: any;

  data: IReservationAll[] | undefined;
  error: any;

  public barChartOptions: ChartOptions = barChartDefaultOptions();
  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartColors: Color[] = chartColors();

  public barChartData: ChartDataSets[] = [
    {data: []}
  ];

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createChart();
  }

  private createChart(): void {
    if (this.state) {
      const chartResult = customerReservationChart(this.state.dash, this.label);
      if (this.state.errorMessage || !chartResult) {
        this.error = {status: 'NO_CONTENT'};
        return;
      }
      this.barChartData = chartResult.chartDataSet;
      this.barChartLabels = chartResult.chartLabels;
    }
  }
}
