import { Component, Input, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { createChart } from '../../util/chart';
import { IChart } from '../../interfaces/dashboard';
import { ICurrency } from '../../interfaces/currency';
import { Subscription } from 'rxjs';
import { AuthUserService } from '../../services/auth-user.service';
import { SharedModule } from '../shared.module';
import { CardChartComponent } from './card-chart.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
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

  ngOnDestroy(): void {
    this.authUserServiceSubscription.unsubscribe();
  }

  onClick(): void {
    if (this.chart) {
      const chart = createChart(this.chart, this.currency, this.isDarkMode, this.locale, this.timeZone);
      this.dialog.open(CardChartComponent, {
        height: '85vh',
        width: '70vw',
        data: {
          chart,
          title: this.title,
        },
      });
    }
    return;
  }
}
