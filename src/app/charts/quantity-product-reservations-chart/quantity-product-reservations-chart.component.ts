import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { IReservationAll } from '../../interfaces/reservation';
import { QuantityProduct } from '../../util/chart';

@Component({
  selector: 'app-quantity-product-reservations-chart',
  templateUrl: './quantity-product-reservations-chart.component.html',
  styleUrls: ['./quantity-product-reservations-chart.component.scss']
})
export class QuantityProductReservationsChartComponent implements OnChanges {
  isLoading = true;
  data: IReservationAll[] | undefined;
  error: any;

  @Input() state: any;
  @Input() label: any;

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

  public barChartData: ChartDataSets[] = [];

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
      const chartResult = QuantityProduct(this.state.data, this.label);
      if (chartResult) {
        this.barChartData = chartResult.chartDataSet;
        this.barChartLabels = chartResult.chartLabels;
      } else {
        this.error = {
          status: 'NO_CONTENT'
        };
      }
    }
  }
}
