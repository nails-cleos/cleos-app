import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { ITracking } from '../../../interfaces/reservation';
import { barChartTimeOptions, trackingCompareChart } from '../../../util/chart';

@Component({
  selector: 'app-tracking-compare-chart',
  templateUrl: './tracking-compare-chart.component.html',
  styleUrls: ['./tracking-compare-chart.component.scss']
})
export class TrackingCompareChartComponent implements OnChanges {
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

  public barChartData: ChartDataSets[] = [];

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createChart();
  }

  private createChart(): void {
    if (this.state) {
      const chartResult = trackingCompareChart(this.state.tracking, this.label);
      if (this.state.errorMessage || !chartResult) {
        this.error = {status: 'NO_CONTENT'};
        return;
      }
      this.barChartData = chartResult.chartDataSet;
      this.barChartLabels = chartResult.chartLabels;
    }
  }
}
