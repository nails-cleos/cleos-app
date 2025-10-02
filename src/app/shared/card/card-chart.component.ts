import { Component, Inject } from '@angular/core';
import { AppMaterialModule } from '../../util/app-material.module';
import { BaseChartDirective } from 'ng2-charts';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IChartUtil } from '../../util/chart';

@Component({
  selector: 'app-card-chart-component',
  templateUrl: './card-chart-component.html',
  styleUrls: ['./card-chart-component.scss'],
  imports: [AppMaterialModule, BaseChartDirective],
})
export class CardChartComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { chart: IChartUtil; title: string }) {
  }
}
