import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { IReservationAll } from '../../interfaces/reservation';

@Component({
  selector: 'app-quantity-product-reservations-chart',
  templateUrl: './quantity-product-reservations-chart.component.html',
  styleUrls: ['./quantity-product-reservations-chart.component.scss']
})
export class QuantityProductReservationsChartComponent implements OnChanges {
  isLoading = true;
  data: IReservationAll[] | undefined;
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
        // TODO: show error
        return;
      }
      this.data = this.state.data;
      const completedList = this.data?.filter(r => r.state === 'COMPLETED');
      if (completedList) {
        const group = completedList.reduce((map, item) => {
          let total = map.get(item.product.name) || 0;
          map.set(item.product.name, ++total);

          return map;
        }, new Map<string, number>());

        this.barChartLabels = Array.from(group.keys());
        this.barChartData[0] = {data: Array.from(group.values()), label: this.label};
      }
    }
  }

}
