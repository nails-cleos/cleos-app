import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { IChartUtil } from '../../util/chart';
import { ChartComponent } from '../chart/chart.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';

type CardChartData = {
  chart: IChartUtil;
  title: string;
}

@Component({
  selector: 'app-card-chart-component',
  templateUrl: './card-chart-component.html',
  styleUrls: ['./card-chart-component.scss'],
  imports: [MatButton, TranslatePipe, ChartComponent, MatDialogTitle, MatDialogContent, MatDialogActions],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardChartComponent {
  readonly dialogRef = inject(MatDialogRef<CardChartComponent>);
  readonly data = inject<CardChartData>(MAT_DIALOG_DATA);

  onNoClick() {
    this.dialogRef.close();
  }
}
