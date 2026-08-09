import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { createChart } from '@app/util/chart';
import { IChart } from '@app/dashboard/dashboard';
import { ICurrency } from '@app/currency/currency';
import { AuthUserService } from '@app/services/auth-user.service';
import { CardChartComponent } from './card-chart.component';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  imports: [
    MatIcon,
    MatIconButton,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  title = input<string>();
  chart = input<IChart>();
  currency = input<ICurrency>();
  locale = input<string>();
  timeZone = input<string>();
  expand = input<boolean>(true);

  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly authUserService: AuthUserService = inject(AuthUserService);

  private authUserSignal = this.authUserService.authUser;

  private isDarkMode = computed(
    () => this.authUserSignal()?.isDarkMode ?? false,
  );

  onClick(): void {
    const chart = this.chart();
    const title = this.title();
    const currency = this.currency();
    const isDarkMode = this.isDarkMode();
    const locale = this.locale();
    const timeZone = this.timeZone();
    if (chart) {
      this.dialog.open(CardChartComponent, {
        width: '70vw',
        maxHeight: '85vh',
        panelClass: 'expanded-chart-dialog-panel',
        data: {
          chart: createChart(chart, currency, isDarkMode, locale, timeZone),
          title: title,
        },
      });
    }
    return;
  }
}
