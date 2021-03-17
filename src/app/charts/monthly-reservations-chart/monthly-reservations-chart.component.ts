import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Label, SingleDataSet } from 'ng2-charts';
import { IReservationAll } from '../../interfaces/reservation';
import { MonthlyReservation } from '../../util/chart';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-monthly-reservation-chart',
  templateUrl: './monthly-reservations-chart.component.html',
  styleUrls: ['./monthly-reservations-chart.component.scss']
})
export class MonthlyReservationsChartComponent implements OnChanges {
  @Input() state: any;

  isLoading = true;
  data: IReservationAll[] | undefined;
  locale: string;
  error: any;

  public pieChartOptions: ChartOptions = {
    responsive: true
  };
  public pieChartLabels: Label[] = [];
  public pieChartData: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

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
      const chartResult = MonthlyReservation(this.state.data, this.locale);
      if (chartResult) {
        this.pieChartData = chartResult.chartData;
        this.pieChartLabels = chartResult.chartLabels;
      }
    }
  }
}
