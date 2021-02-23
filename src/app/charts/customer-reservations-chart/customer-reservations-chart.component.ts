import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { IReservationAll } from '../../interfaces/reservation';

@Component({
  selector: 'app-customer-reservations-chart',
  templateUrl: './customer-reservations-chart.component.html',
  styleUrls: ['./customer-reservations-chart.component.scss']
})
export class CustomerReservationsChartComponent implements OnChanges {
  @Input() state: any;

  isLoading = true;
  data: IReservationAll[] | undefined;

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
      backgroundColor: 'rgb(103, 58, 183)'
    }
  ];

  public barChartData: ChartDataSets[] = [
    {data: [], label: 'Customers'}
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
      const now = new Date();
      const filterDate = new Date(new Date().setMonth(now.getMonth() - 12, 0));
      this.data = this.state.data;
      const completedList = this.data?.filter(r => r.state === 'COMPLETED' && new Date(r.start) > filterDate);
      if (completedList) {
        const group = completedList.reduce((map, item) => {
          let total = map.get(item.customer.username) || 0;
          map.set(item.customer.username, ++total);

          return map;
        }, new Map<string, number>());

        this.barChartLabels = Array.from(group.keys());
        this.barChartData[0].data = Array.from(group.values());
      }
    }
  }
}
