import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { IUpcomingAll } from '@app/reservation/reservation';
import { customerEditDialog, getPrice, openDialog } from '@app/util/helper';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  createNewDate,
  isSameTimeZone,
  newDateTimestamp,
  reservationDuration,
} from '@app/util/dates';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { CurrencySymbolPipe } from '@app/pipes/currency-symbol.pipe';
import { PaymentPreviewComponent } from '@app/shared/payment-preview/payment-preview.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { DatePipe, DecimalPipe } from '@angular/common';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-upcoming',
  templateUrl: './upcoming.component.html',
  styleUrls: ['./upcoming.component.scss'],
  imports: [
    MatIcon,
    MatIconButton,
    MatButton,
    TranslatePipe,
    DecimalPipe,
    RouterLink,
    DatePipe,
    CurrencySymbolPipe,
    CurrencySymbolPipe,
    PaymentPreviewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpcomingComponent {
  private readonly translateService: TranslateService =
    inject(TranslateService);
  private readonly navigationService: NavigationService =
    inject(NavigationService);
  private readonly dialog: MatDialog = inject(MatDialog);

  small = input.required<boolean>();
  upcoming = input<IUpcomingAll>();

  readonly language: string = this.navigationService.language;

  upcomingComputed = computed(() => {
    const upcoming = this.upcoming();
    if (!upcoming) {
      return undefined;
    }
    let rowSpan = 0;
    if (upcoming.additional) {
      if (upcoming.additional.length) {
        if (upcoming.additional.length > 1) {
          rowSpan = (upcoming.additional.length / 2) >> 0;
        } else {
          rowSpan = 1;
        }
      }
    }
    const price = getPrice(upcoming, upcoming.payments);
    const duration = reservationDuration(upcoming);
    const start = newDateTimestamp(upcoming.timestamp);
    const end = createNewDate(
      start,
      start.getHours() + duration.hour,
      start.getMinutes() + duration.minute,
    );

    return Object.assign({}, upcoming, { rowSpan, price, end, start });
  });

  constructor() {}

  edit(): void {
    const upcoming = this.upcoming();
    if (upcoming && !upcoming.canEdit) {
      customerEditDialog(
        this.dialog,
        this.navigationService,
        upcoming.id,
        upcoming.room.currency,
        this.small(),
        upcoming.price,
      );
    } else {
      this.navigationService.navigate(['me', 'reservation', upcoming?.id]);
    }
  }

  showTimeZone(): boolean {
    const upcoming = this.upcoming();
    return upcoming ? !isSameTimeZone(upcoming.room.timeZone) : false;
  }

  openDialog = (reservationDate: Date): void => {
    const upcoming = this.upcoming();
    if (upcoming) {
      openDialog(
        upcoming.room,
        this.language,
        this.translateService,
        this.dialog,
        reservationDate,
      );
    }
  };
}
