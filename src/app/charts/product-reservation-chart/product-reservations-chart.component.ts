import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import { IReservationAll } from '../../interfaces/reservation';

@Component({
  selector: 'app-product-reservations-chart',
  templateUrl: './product-reservations-chart.component.html',
  styleUrls: ['./product-reservations-chart.component.scss']
})
export class ProductReservationsChartComponent implements OnChanges {
  isLoading = true;
  data: IReservationAll[] | undefined;
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
        // TODO: show error
        return;
      }
      this.data = this.state.data;
      const completedList = this.data?.filter(r => r.state === 'COMPLETED');

      if (completedList) {
        const distRoom: Array<any> = [...new Set(completedList.map(x => x.room.name))];

        const group = completedList.reduce((map, item) => {
          const productMap = map.get(item.product.name) || new Map();
          let total = productMap.get(item.room.name) || 0;
          productMap.set(item.room.name, ++total);

          map.set(item.product.name, productMap);

          return map;
        }, new Map<string, Map<string, number>>());

        this.radarChartLabels = Array.from(group.keys());

        this.radarChartData = distRoom.reduce((r, i) => {
          const o = {label: i, data: []};

          r = [...r, o];

          return r;
        }, []);

        group.forEach(value => {
          this.radarChartData.forEach((v: any, k: any) => {
            // @ts-ignore
            const a = value.get(this.radarChartData[k].label) || 0;
            // @ts-ignore
            this.radarChartData[k].data = [...this.radarChartData[k].data, a];
          });
        });
      }
    }
  }
}
