import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { ITracking } from '../../interfaces/reservation';
import { barChartTimeOptions, trackingAverageChart } from '../../util/chart';

@Component({
  selector: 'app-tracking-average-chart',
  templateUrl: './tracking-average-chart.component.html',
  styleUrls: ['./tracking-average-chart.component.scss']
})
export class TrackingAverageChartComponent implements OnChanges {
  @Input() state: any;
  @Input() label: any;

  data: ITracking[] | undefined;
  error: any;

  public barChartOptions: ChartOptions = barChartTimeOptions();

  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartColors: Color[] = [
    {
      backgroundColor: 'rgba(103, 58, 183, 0.7)'
    }
  ];

  public barChartData: ChartDataSets[] = [
    {data: [3600, 4500], label: 'Min'},
    {data: [3600, 4500], label: 'Avg'},
    {data: [3600, 4500], label: 'Max'}
  ];

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createChart();
  }

  private createChart(): void {
    if (this.state) {
      if (this.state.errorMessage) {
        this.error = this.state.error;
        return;
      }
      const chartResult = trackingAverageChart(this.state.tracking, this.label);
      if (chartResult) {
        this.barChartData = chartResult.chartDataSet;
        this.barChartLabels = chartResult.chartLabels;
      } else {
        this.error = {
          status: 'NO_CONTENT'
        };
      }
    }
  }
}
