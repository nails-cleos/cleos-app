import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import { IReservationAll } from '../../interfaces/reservation';
import { ProductReservation } from '../../util/chart';

@Component({
  selector: 'app-product-reservations-chart',
  templateUrl: './product-reservations-chart.component.html',
  styleUrls: ['./product-reservations-chart.component.scss']
})
export class ProductReservationsChartComponent implements OnChanges {
  isLoading = true;
  data: IReservationAll[] | undefined;
  error: any;

  @Input() state: any;

  public radarChartOptions: ChartOptions = {
    responsive: true
  };

  public radarChartLabels: Label[] = [];
  public radarChartData: ChartDataSets[] = [];
  public radarChartType: ChartType = 'radar';

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
      const chartResult = ProductReservation(this.state.data);
      if (chartResult) {
        this.radarChartData = chartResult.chartDataSet;
        this.radarChartLabels = chartResult.chartLabels;
      }
    } else {
      this.error = {
        status: 'NO_CONTENT'
      };
    }
  }
}
