import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { createChart, IChartUtil } from '../../util/chart';
import { IChart } from '../../interfaces/dashboard';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() title: string | undefined;
  @Input() expand = true;
  @Input() chart?: IChart;
  @Input() isDark?: boolean;

  constructor(public dialog: MatDialog) {
  }

  get onClick(): void {
    if (this.chart) {
      const chart = createChart(this.chart, this.isDark);
      this.dialog.open(CardChartComponent, {
        height: '85vh',
        width: '70vw',
        data: {
          chart,
          title: this.title
        }
      });
    }
    return;
  }
}

@Component({
  selector: 'app-card-chart-component',
  templateUrl: './card-chart-component.html',
  styleUrls: ['./card-chart-component.scss']
})
export class CardChartComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { chart: IChartUtil; title: string }) {
  }
}

