import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { IReservationAll } from '../../interfaces/reservation';

@Component({
  selector: 'app-annual-reservations-chart',
  templateUrl: './annual-reservations-chart.component.html',
  styleUrls: ['./annual-reservations-chart.component.scss']
})
export class AnnualReservationsChartComponent implements OnChanges {
  @Input() state: any;

  isLoading = true;
  data: IReservationAll[] | undefined;
  locale: string;

  public lineChartData: ChartDataSets[] = [
    {data: [], label: 'Reservations'}
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
        // TODO: show error
        return;
      }
      const now = new Date();
      const filterDate = new Date(new Date().setMonth(now.getMonth() - 12, 0));
      this.data = this.state.data;
      const completedList = this.data?.filter(r => r.state === 'COMPLETED' && new Date(r.start) > filterDate);
      if (completedList) {
        const group = completedList.reduce((map, item) => {
          const formattedDate = this.formatDate(new Date(item.start));
          const key = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

          const price = map.get(key) || 0;

          map.set(key, price + item.product.price);

          return map;
        }, new Map<string, number>());

        let data: number[] = [];
        let label: string[] = [];

        for (let i = 12; i >= 0; i--) {
          const date = new Date(new Date().setMonth(now.getMonth() - i, 1));
          const formattedDate = this.formatDate(date);
          const key = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
          label = [...label, key];

          const count = group.get(key) || 0;
          data = [...data, count];
        }
        this.lineChartData[0].data = data;
        this.lineChartLabels = label;
      }
    }
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString(this.locale, {
      month: 'short', year: 'numeric'
    }).replace(/ /g, '-');
  }
}
