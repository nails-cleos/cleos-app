import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_SNACK_BAR_DATA as MAT_SNACK_BAR_DATA, MatLegacySnackBarRef as MatSnackBarRef } from '@angular/material/legacy-snack-bar';
import { localeTimeZoneDate } from '../../../util/dates';
import { TranslateService } from '@ngx-translate/core';

interface ITimeZone {
  date: Date;
  timeZone: string;
}

@Component({
  selector: 'app-time-zone-snack-bar',
  templateUrl: './time-zone-snack-bar.component.html',
  styleUrls: ['./time-zone-snack-bar.component.scss']
})
export class TimeZoneSnackBarComponent {

  localDate: string;
  timeZoneDate: string;
  action: string;

  constructor(public snackBarRef: MatSnackBarRef<TimeZoneSnackBarComponent>,
              @Inject(MAT_SNACK_BAR_DATA) public data: ITimeZone, private readonly translate: TranslateService) {
    this.localDate = this.getDateTime(data.date);
    this.timeZoneDate = this.getDateTime(data.date, data.timeZone);
    this.action = this.translate.instant('COMMON.TIME_ZONE.ACTION');
  }

  private getDateTime(reservationDate: Date, timeZone?: string): string {
    return localeTimeZoneDate(this.translate.currentLang, reservationDate, timeZone);
  }
}
