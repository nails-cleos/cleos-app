import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { AnnualReservation } from '../../util/chart';

@Component({
  selector: 'app-annual-reservations-chart',
  templateUrl: './annual-reservations-chart.component.html',
  styleUrls: ['./annual-reservations-chart.component.scss']
})
export class AnnualReservationsChartComponent implements OnChanges {
  @Input() state: any;
  @Input() label: any;

  isLoading = true;
  error: string | undefined;
  locale: string;

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
      backgroundColor: 'rgba(103, 58, 183,0.3)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [];

  constructor() {
    const userLang = navigator.language;
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
      const chartResult = AnnualReservation(this.state.data, this.locale, this.label);
      if (chartResult) {
        this.lineChartData = chartResult.chartDataSet;
        this.lineChartLabels = chartResult.chartLabels;
      }
    }
  }
}
