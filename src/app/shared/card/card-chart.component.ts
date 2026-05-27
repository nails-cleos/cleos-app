import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppMaterialModule } from '../../util/app-material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IChartUtil } from '../../util/chart';
import { ChartComponent } from '../chart/chart.component';
import { TranslatePipe } from '@ngx-translate/core';

type CardChartData = {
  chart: IChartUtil;
  title: string;
}

@Component({
  selector: 'app-card-chart-component',
  templateUrl: './card-chart-component.html',
  styleUrls: ['./card-chart-component.scss'],
  imports: [AppMaterialModule, ChartComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardChartComponent {
  readonly dialogRef = inject(MatDialogRef<CardChartComponent>);
  readonly data = inject<CardChartData>(MAT_DIALOG_DATA);

  onNoClick() {
    this.dialogRef.close();
  }
}
