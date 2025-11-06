import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { createChart, IChartUtil } from '../../util/chart';
import { IChart } from '../../interfaces/dashboard';
import { ICurrency } from '../../interfaces/currency';
import { Subscription } from 'rxjs';
import { AuthUserService } from '../../services/auth-user.service';
import { ErrorComponent } from '../error/error.component';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  imports: [ErrorComponent, BaseChartDirective],
})
export class ChartComponent implements OnChanges, OnDestroy {
  @Input() error: any;
  @Input() chartSummary?: IChart;
  @Input() isLoading: any | boolean;
  @Input() currency?: ICurrency;
  @Input() locale?: string;
  @Input() timeZone?: string;

  chart: IChartUtil | undefined;

  private authUserServiceSubscription: Subscription;
  private isDarkMode: boolean;

  constructor(private authUserService: AuthUserService) {
  	this.isDarkMode = false;
  	this.authUserServiceSubscription =
      this.authUserService.authUser.subscribe(value => this.isDarkMode = value.isDarkMode);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ngOnChanges(_changes: SimpleChanges): void {
  	this.createChart();
  }

  ngOnDestroy(): void {
  	this.authUserServiceSubscription.unsubscribe();
  }

  private createChart = (): void => {
  	if (!this.chartSummary || this.error || !this.chartSummary.type) {
  		this.error = { status: 'NO_CONTENT' };
  		return;
  	}
  	this.error = undefined;
  	this.chart = createChart(this.chartSummary, this.currency, this.isDarkMode, this.locale, this.timeZone);
  };
}
