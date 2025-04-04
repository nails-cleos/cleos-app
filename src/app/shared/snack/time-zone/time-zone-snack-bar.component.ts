import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { localeTimeZoneDate } from '../../../util/dates';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../../shared.module';

interface ITimeZone {
  date: Date;
  timeZone: string;
}

@Component({
  selector: 'app-time-zone-snack-bar',
  templateUrl: './time-zone-snack-bar.component.html',
  styleUrls: ['./time-zone-snack-bar.component.scss'],
  imports: [SharedModule]
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

  private getDateTime = (
    reservationDate: Date,
    timeZone?: string
  ): string => localeTimeZoneDate(this.translate.currentLang, reservationDate, timeZone);
}
