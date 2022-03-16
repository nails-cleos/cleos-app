import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { createChart, IChartUtil } from '../../util/chart';
import { IChart } from '../../interfaces/dashboard';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnChanges {
  @Input() error: any;
  @Input() chartSummary?: IChart;
  @Input() isDark?: boolean;
  @Input() isLoading: any | boolean;

  chart: IChartUtil | undefined;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createChart();
  }

  private createChart(): void {
    if (!this.chartSummary || this.error || !this.chartSummary.type) {
      this.error = {status: 'NO_CONTENT'};
      return;
    }
    this.error = undefined;
    this.chart = createChart(this.chartSummary, this.isDark);
  }
}
