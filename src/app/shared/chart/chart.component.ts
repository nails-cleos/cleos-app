import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { createChart, IChartUtil } from '../../util/chart';
import { IChart } from '../../dashboard/dashboard';
import { ICurrency } from '../../currency/currency';
import { AuthUserService } from '../../services/auth-user.service';
import { ErrorComponent } from '../error/error.component';
import { BaseChartDirective } from 'ng2-charts';
import { IError } from '../../interfaces/common';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  imports: [ErrorComponent, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent {
  chartSummary = input<IChart>();
  chartData = input<IChartUtil>();
  currency = input<ICurrency>();
  locale = input<string>();
  timeZone = input<string>();
  isLoading = input<boolean>(false);
  error = input<IError>();

  private readonly authUserService: AuthUserService = inject(AuthUserService);

  private authUserSignal = this.authUserService.authUser;

  private isDarkMode = computed(() => this.authUserSignal()?.isDarkMode ?? false);

  errorSignal = signal(this.error());

  chart = signal<IChartUtil | undefined>(undefined);

  constructor() {
    effect(() => {
      const chartData = this.chartData();
      const chartSummary = this.chartSummary();
      if (chartData) {
        this.errorSignal.set(undefined);
        this.chart.set(chartData);
        return;
      }
      if (!chartSummary || this.error() || !chartSummary.type) {
        this.errorSignal.set({ status: 'NO_CONTENT' });
        return;
      }
      this.errorSignal.set(undefined);
      this.chart.set(createChart(chartSummary, this.currency(), this.isDarkMode(), this.locale(), this.timeZone()));
    });
  }
}
