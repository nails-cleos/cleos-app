import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { IReservationAll } from '../../../interfaces/reservation';
import { chartColors, defaultOptions, lastMonthReservationChart } from '../../../util/chart';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-last-month-reservations-chart',
  templateUrl: './last-month-reservations-chart.component.html',
  styleUrls: ['./last-month-reservations-chart.component.scss']
})
export class LastMonthReservationsChartComponent implements OnChanges {
  @Input() state: any;
  @Input() label: any;

  data: IReservationAll[] | undefined;
  error: any;

  public lineChartData: ChartDataSets[] = [
    {data: []}
  ];
  public lineChartLabels: Label[] = [];
  public lineChartOptions: ChartOptions = defaultOptions();
  public lineChartColors: Color[] = chartColors();
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [];

  constructor(public translate: TranslateService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createChart();
  }

  private createChart(): void {
    if (this.state) {
      const chartResult = lastMonthReservationChart(this.state.dash, this.translate.currentLang, this.label);
      if (this.state.errorMessage || !chartResult) {
        this.error = {status: 'NO_CONTENT'};
        return;
      }
      this.lineChartData = chartResult.chartDataSet;
      this.lineChartLabels = chartResult.chartLabels;
    }
  }
}
