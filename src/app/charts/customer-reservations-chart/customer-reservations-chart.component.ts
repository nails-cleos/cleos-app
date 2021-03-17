import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { IReservationAll } from '../../interfaces/reservation';
import { CustomerReservation } from '../../util/chart';

@Component({
  selector: 'app-customer-reservations-chart',
  templateUrl: './customer-reservations-chart.component.html',
  styleUrls: ['./customer-reservations-chart.component.scss']
})
export class CustomerReservationsChartComponent implements OnChanges {
  @Input() state: any;
  @Input() label: any;

  isLoading = true;
  data: IReservationAll[] | undefined;
  error: any;

  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };
  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartColors: Color[] = [
    {
      backgroundColor: 'rgba(103, 58, 183, 0.7)'
    }
  ];

  public barChartData: ChartDataSets[] = [
    {data: []}
  ];

  constructor() {
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
      const chartResult = CustomerReservation(this.state.data, this.label);
      if (chartResult) {
        this.barChartData = chartResult.chartDataSet;
        this.barChartLabels = chartResult.chartLabels;
      }
    }
  }
}
