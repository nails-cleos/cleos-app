import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { IReservationAll } from '../../interfaces/reservation';
import { lastMonthReservationChart } from '../../util/chart';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-last-month-reservations-chart',
  templateUrl: './last-month-reservations-chart.component.html',
  styleUrls: ['./last-month-reservations-chart.component.scss']
})
export class LastMonthReservationsChartComponent implements OnChanges {
  @Input() state: any;
  @Input() label: any;

  isLoading = true;
  data: IReservationAll[] | undefined;
  locale: string;
  error: any;

  public lineChartData: ChartDataSets[] = [
    {data: []}
  ];
  public lineChartLabels: Label[] = [];
  public lineChartOptions: ChartOptions = {
    responsive: true
  };
  public lineChartColors: Color[] = [
    {
      borderColor: 'rgb(103, 58, 183)',
      backgroundColor: 'rgba(103, 58, 183, 0.3)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [];

  constructor(public translate: TranslateService) {
    const userLang = this.translate.currentLang;
    const index = userLang.indexOf('-');
    this.locale = index === -1 ? userLang : userLang.substr(0, index);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createChart();
  }

  private createChart(): void {
    if (this.state) {
      this.isLoading = this.state.isLoading;
      if (this.state.errorMessage) {
        this.error = this.state.error;
        return;
      }
      const chartResult = lastMonthReservationChart(this.state.data, this.locale, this.label);
      if (chartResult) {
        this.lineChartData = chartResult.chartDataSet;
        this.lineChartLabels = chartResult.chartLabels;
      } else {
        this.error = {
          status: 'NO_CONTENT'
        };
      }
    }
  }
}
