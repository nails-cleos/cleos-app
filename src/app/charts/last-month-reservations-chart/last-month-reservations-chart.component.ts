import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { IReservationAll } from '../../interfaces/reservation';

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
        let data: number[] = [];
        let label: string[] = [];

        for (let i = 12; i >= 0; i--) {
          const date = new Date(new Date().setMonth(now.getMonth() - i, 1));
          const formattedDate = this.formatDate(date);
          const total: number = completedList.filter(r => this.formatDate(new Date(r.start)) === formattedDate).length;

          const key = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
          label = [...label, key];

          data = [...data, total];
        }
        this.lineChartData[0] = {data, label: this.label};
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
