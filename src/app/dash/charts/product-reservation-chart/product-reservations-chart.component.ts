import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { IReservationAll } from '../../../interfaces/reservation';
import { chartColors, defaultOptions, productReservationChart } from '../../../util/chart';

@Component({
  selector: 'app-product-reservations-chart',
  templateUrl: './product-reservations-chart.component.html',
  styleUrls: ['./product-reservations-chart.component.scss']
})
export class ProductReservationsChartComponent implements OnChanges {
  @Input() state: any;

  data: IReservationAll[] | undefined;
  error: any;

  public radarChartOptions: ChartOptions = defaultOptions();
  public radarChartLabels: Label[] = [];
  public radarChartData: ChartDataSets[] = [];
  public radarChartType: ChartType = 'radar';
  public radarChartColors: Color[] = chartColors();

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createChart();
  }

  private createChart(): void {
    if (this.state) {
      const chartResult = productReservationChart(this.state.dash);
      if (this.state.errorMessage || !chartResult) {
        this.error = {status: 'NO_CONTENT'};
        return;
      }
      this.radarChartData = chartResult.chartDataSet;
      this.radarChartLabels = chartResult.chartLabels;
    }
  }
}
