import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { createChart, IChartUtil } from '../../../../util/chart';
import { IChartSummary } from '../../../../interfaces/dashboard';

@Component({
  selector: 'app-overview-chart',
  templateUrl: './overview-chart.component.html',
  styleUrls: ['./overview-chart.component.scss']
})
export class OverviewChartComponent implements OnChanges {
  @Input() chartSummary: IChartSummary | undefined;
  @Input() error: any;

  chart: IChartUtil | undefined;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chartSummary) {
      this.chart = createChart(this.chartSummary);
    }
  }
}
