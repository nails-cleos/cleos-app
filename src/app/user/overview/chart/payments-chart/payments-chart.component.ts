import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { IReservationAll } from '../../../../interfaces/reservation';
import { chartArrayColors, paymentChart, pieChartPercentageOptions } from '../../../../util/chart';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-payments-chart',
  templateUrl: './payments-chart.component.html',
  styleUrls: ['./payments-chart.component.scss']
})
export class PaymentsChartComponent implements OnChanges {
  @Input() state: any;

  data: IReservationAll[] | undefined;
  error: any;

  public pieChartOptions: ChartOptions = pieChartPercentageOptions();
  public pieChartLabels: Label[] = [];
  public pieChartData: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  public pieChartColors: Color[] = chartArrayColors();

  constructor(private translate: TranslateService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createChart();
  }

  private createChart(): void {
    if (this.state && ((this.state.data && this.state.data.reservations) || this.state.errorMessage)) {
      const chartResult = paymentChart(this.state.data.reservations, this.translate);
      if (this.state.errorMessage || !chartResult) {
        this.error = {status: 'NO_CONTENT'};
        return;
      }
      this.pieChartData = chartResult.chartData;
      this.pieChartLabels = chartResult.chartLabels;
    }
  }
}
