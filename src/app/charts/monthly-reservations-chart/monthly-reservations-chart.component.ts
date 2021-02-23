import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Label, SingleDataSet } from 'ng2-charts';
import { IReservationAll } from '../../interfaces/reservation';

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

  public pieChartOptions: ChartOptions = {
    responsive: true
  };
  public pieChartLabels: Label[] = [];
  public pieChartData: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

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
      const filterDate = new Date(now.setMonth(new Date().getMonth() - 12, 0));
      this.data = this.state.data;
      const completedList = this.data?.filter(r => r.state === 'COMPLETED' && new Date(r.start) > filterDate);
      if (completedList) {
        const group = completedList.reduce((map, item) => {
          const formattedDate = new Date(item.start).toLocaleDateString(this.locale, {
            month: 'short', year: 'numeric'
          }).replace(/ /g, '-');


          const key = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

          let total = map.get(key) || 0;
          map.set(key, ++total);

          return map;
        }, new Map<string, number>());

        this.pieChartLabels = Array.from(group.keys());
        this.pieChartData = Array.from(group.values());
      }
    }
  }
}
