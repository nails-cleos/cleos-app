import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { IReservationAll } from '../../../interfaces/reservation';
import { chartArrayColors, defaultOptions, monthlyReservationChart } from '../../../util/chart';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-monthly-reservation-chart',
  templateUrl: './monthly-reservations-chart.component.html',
  styleUrls: ['./monthly-reservations-chart.component.scss']
})
export class MonthlyReservationsChartComponent implements OnChanges {
  @Input() state: any;

  data: IReservationAll[] | undefined;
  error: any;

  public pieChartOptions: ChartOptions = defaultOptions();
  public pieChartLabels: Label[] = [];
  public pieChartData: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  public pieChartColors: Color[] = chartArrayColors();

  constructor(public translate: TranslateService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createChart();
  }

  private createChart(): void {
    if (this.state) {
      const chartResult = monthlyReservationChart(this.state.dash, this.translate.currentLang);
      if (this.state.errorMessage || !chartResult) {
        this.error = {status: 'NO_CONTENT'};
        return;
      }
      this.pieChartData = chartResult.chartData;
      this.pieChartLabels = chartResult.chartLabels;
    }
  }
}
