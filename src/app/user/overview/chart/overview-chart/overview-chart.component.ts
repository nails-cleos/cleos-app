import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { createChart, IChartUtil } from '../../../../util/chart';
import { IChart } from '../../../../interfaces/dashboard';
import { ICurrency } from '../../../../interfaces/currency';
import { SharedModule } from '../../../../shared/shared.module';
import { ErrorComponent } from '../../../../shared/error/error.component';

@Component({
  selector: 'app-overview-chart',
  templateUrl: './overview-chart.component.html',
  styleUrls: ['./overview-chart.component.scss'],
  imports: [SharedModule, ErrorComponent]
})
export class OverviewChartComponent implements OnChanges {
  @Input() chartSummary: IChart | undefined;
  @Input() error: any;
  @Input() currency?: ICurrency;
  @Input() isDark?: boolean;

  chart: IChartUtil | undefined;

  constructor() {
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ngOnChanges(_changes: SimpleChanges): void {
    if (this.chartSummary) {
      this.chart = createChart(this.chartSummary, this.currency, this.isDark);
    }
  }
}
