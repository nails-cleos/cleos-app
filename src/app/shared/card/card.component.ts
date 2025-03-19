import { Component, Inject, Input, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { createChart, IChartUtil } from '../../util/chart';
import { IChart } from '../../interfaces/dashboard';
import { ICurrency } from '../../interfaces/currency';
import { Subscription } from 'rxjs';
import { AuthUserService } from '../../services/auth-user.service';
import { SharedModule } from "../shared.module";

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: true,
  imports: [SharedModule],
})
export class CardComponent implements OnDestroy {
  @Input() title: string | undefined;
  @Input() expand = true;
  @Input() chart?: IChart;
  @Input() currency?: ICurrency;
  @Input() locale?: string;
  @Input() timeZone?: string;

  private authUserServiceSubscription: Subscription;
  private isDarkMode: boolean;

  constructor(public dialog: MatDialog, private authUserService: AuthUserService) {
    this.isDarkMode = false;
    this.authUserServiceSubscription =
      this.authUserService.authUser.subscribe(value => this.isDarkMode = value.isDarkMode);
  }

  get onClick(): void {
    if (this.chart) {
      const chart = createChart(this.chart, this.currency, this.isDarkMode, this.locale, this.timeZone);
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

  ngOnDestroy(): void {
    this.authUserServiceSubscription.unsubscribe();
  }
}

@Component({
  selector: 'app-card-chart-component',
  templateUrl: './card-chart-component.html',
  styleUrls: ['./card-chart-component.scss'],
  standalone: true,
  imports: [SharedModule],
})
export class CardChartComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { chart: IChartUtil; title: string }) {
  }
}

