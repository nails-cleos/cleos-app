import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  signal,
} from '@angular/core';
import { createChart, IChartUtil } from '@app/util/chart';
import { IChart } from '@app/dashboard/dashboard';
import { ICurrency } from '@app/currency/currency';
import { ErrorComponent } from '@app/shared/error/error.component';
import { IError } from '@app/interfaces/common';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-overview-chart',
  templateUrl: './overview-chart.component.html',
  styleUrls: ['./overview-chart.component.scss'],
  imports: [ErrorComponent, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewChartComponent {
  chartSummary = input<IChart>();
  error = input<IError>();
  currency = input<ICurrency>();
  isDark = input<boolean>(false);

  chartSignal = signal<IChartUtil | undefined>(undefined);

  constructor() {
    effect(() => {
      const chartSummary = this.chartSummary();
      if (chartSummary) {
        this.chartSignal.set(
          createChart(chartSummary, this.currency(), this.isDark()),
        );
      }
    });
  }
}
