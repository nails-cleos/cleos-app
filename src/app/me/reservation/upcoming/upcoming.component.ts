import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IUpcomingAll } from '../../../interfaces/reservation';
import { customerEditDialog, getPrice, openDialog } from '../../../util/helper';
import { TranslateService } from '@ngx-translate/core';
import { stampAnimation, transitionAnimation } from '../../../util/animation';
import { createNewDate, isSameTimeZone, newDateTimestamp, reservationDuration } from '../../../util/dates';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SharedModule } from "../../../shared/shared.module";
import { RoomNamePipe } from "../../../pipes/room-name.pipe";
import { CurrencySymbolPipe } from "../../../pipes/currency-symbol.pipe";

@Component({
  selector: 'app-upcoming',
  animations: [transitionAnimation, stampAnimation],
  templateUrl: './upcoming.component.html',
  styleUrls: ['./upcoming.component.scss'],
  standalone: true,
  imports: [SharedModule, RoomNamePipe, CurrencySymbolPipe]
})
export class UpcomingComponent implements OnChanges {
  @Input() upcoming: IUpcomingAll | undefined;
  @Input() small!: boolean;

  dateFormat: string;
  language: string;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private router: Router) {
    this.dateFormat = this.translate.currentLang;
    this.language = this.translate.currentLang;
  }

  get showTimeZone(): boolean {
    return this.upcoming ? !isSameTimeZone(this.upcoming.room.timeZone) : false;
  }

  get edit(): void {
    if (this.upcoming && !this.upcoming.canEdit) {
      return customerEditDialog(this.dialog, this.router, this.upcoming.id, this.upcoming.room.currency, this.small,
        this.language,
        this.upcoming.price);
    }
    this.router.navigate([this.language, 'me', 'reservation', this.upcoming?.id]);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ngOnChanges(_changes: SimpleChanges): void {
    this.loadUpcoming();
  }

  openDialog = (reservationDate: Date): void => {
    if (this.upcoming) {
      openDialog(this.upcoming.room, this.dateFormat, this.translate, this.dialog, reservationDate);
    }
  }

  private loadUpcoming = (): void => {
    if (this.upcoming && this.upcoming.id) {
      let rowSpan = 0;
      if (this.upcoming.additional) {
        if (this.upcoming.additional.length) {
          if (this.upcoming.additional.length > 1) {
            rowSpan = (this.upcoming.additional.length / 2) >> 0;
          } else {
            rowSpan = 1;
          }
        }
      }
      const price = getPrice(this.upcoming, this.upcoming.payments);
      const duration = reservationDuration(this.upcoming);
      const start = newDateTimestamp(this.upcoming.timestamp);
      const end = createNewDate(start, start.getHours() + duration.hour,
        start.getMinutes() + duration.minute);

      this.upcoming = Object.assign({}, this.upcoming, { rowSpan, price, end, start });
    }
  }
}
