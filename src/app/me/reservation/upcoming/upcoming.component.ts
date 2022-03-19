import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IUpcomingAll } from '../../../interfaces/reservation';
import { currencySymbol, getPrice, getUserName } from '../../../util/helper';
import { TranslateService } from '@ngx-translate/core';
import { stampAnimation, transitionAnimation } from '../../../util/animation';
import { createNewDate, newDate, reservationDuration } from '../../../util/dates';

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

  constructor(private readonly translate: TranslateService) {
    this.language = translate.currentLang;
    this.showHeader = false;
  }

  get professionalName(): string {
    return this.upcoming ? getUserName(this.upcoming.room.professional) : '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadUpcoming();
  }

  getCurrencySymbol(): string {
    return this.upcoming ? currencySymbol(this.upcoming.room.currency) : '';
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
      const start = newDate(this.upcoming.start);
      const end = createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);

      this.upcoming = Object.assign({}, this.upcoming, {rowSpan, price, end});
    }
  }
}
