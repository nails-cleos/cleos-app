import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { createChart, IChartUtil } from '../../../util/chart';
import { IChartSummary } from '../../../interfaces/dashboard';

@Component({
  selector: 'app-dashboard-chart',
  templateUrl: './dashboard-chart.component.html',
  styleUrls: ['./dashboard-chart.component.scss']
})
export class DashboardChartComponent implements OnChanges {
  @Input() state: any;
  @Input() chartSummary?: IChartSummary;
  @Input() isDark?: boolean;

  chart: IChartUtil | undefined;
  error: any;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createChart();
  }

  private createChart(): void {
    if (this.state) {
      if (!this.chartSummary || this.state.errorMessage || !this.chartSummary.type) {
        this.error = {status: 'NO_CONTENT'};
        return;
      }
      this.chart = createChart(this.chartSummary, this.isDark);
    }
  }
}
