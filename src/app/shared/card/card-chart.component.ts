import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppMaterialModule } from '../../util/app-material.module';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IChartUtil } from '../../util/chart';
import { ChartComponent } from '../chart/chart.component';

type CardChartData = {
  chart: IChartUtil;
  title: string;
}

@Component({
  selector: 'app-card-chart-component',
  templateUrl: './card-chart-component.html',
  styleUrls: ['./card-chart-component.scss'],
  imports: [AppMaterialModule, ChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardChartComponent {
  readonly data = inject<CardChartData>(MAT_DIALOG_DATA);
}
