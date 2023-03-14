import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IUpcomingAll } from '../../../interfaces/reservation';
import { getPrice, openDialog } from '../../../util/helper';
import { TranslateService } from '@ngx-translate/core';
import { stampAnimation, transitionAnimation } from '../../../util/animation';
import { createNewDate, isSameTimeZone, newDateTimestamp, reservationDuration } from '../../../util/dates';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-upcoming',
  animations: [transitionAnimation, stampAnimation],
  templateUrl: './upcoming.component.html',
  styleUrls: ['./upcoming.component.scss']
})
export class UpcomingComponent implements OnChanges {
  @Input() upcoming: IUpcomingAll | undefined;
  @Input() showHeader: boolean;

  language: string;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog) {
    this.language = translate.currentLang;
    this.showHeader = false;
  }

  get showTimeZone(): boolean {
    return this.upcoming ? !isSameTimeZone(this.upcoming.room.timeZone) : false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadUpcoming();
  }

  openDialog(reservationDate: Date): void {
    if (this.upcoming) {
      openDialog(this.upcoming.room, this.language, this.translate, this.dialog, reservationDate);
    }
  }

  private loadUpcoming(): void {
    if (this.upcoming && this.upcoming.id) {
      let rowSpan = 0;
      if (this.upcoming.additional) {
        if (this.upcoming.additional.length) {
          if (this.upcoming.additional.length > 1) {
            rowSpan = this.upcoming.additional.length - 1;
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

      this.upcoming = Object.assign({}, this.upcoming, {rowSpan, price, end, start});
    }
  }
}
