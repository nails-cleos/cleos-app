import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import { ITracking } from '../../interfaces/reservation';
import { barChartTimeOptions, trackingAverageChart, trackingCompareChart } from '../../util/chart';

@Component({
  selector: 'app-tracking-compare-chart',
  templateUrl: './tracking-compare-chart.component.html',
  styleUrls: ['./tracking-compare-chart.component.scss']
})
export class TrackingCompareChartComponent implements OnChanges {
  @Input() state: any;
  @Input() label: any;

  isLoading = true;
  data: ITracking[] | undefined;
  error: any;

  public barChartOptions: ChartOptions = barChartTimeOptions();

  public barChartLabels: Label[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createChart();
  }

  private createChart(): void {
    if (this.state) {
      this.isLoading = this.state.isLoading;
      if (this.state.errorMessage) {
        this.error = this.state.error;
        return;
      }
      const chartResult = trackingCompareChart(this.state.tracking, this.label);
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
