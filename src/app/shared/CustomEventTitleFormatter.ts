import { CalendarEvent, CalendarEventTitleFormatter } from 'angular-calendar';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { dateToTimestamp, formatDateMonth, getTimeZone, isSameTimeZone, newDateTimestamp } from '../util/dates';
import { IMeta } from '../util/event';
import { ReservationIconKey, ReservationIconName } from '../util/icon';
import { snakeToCamel } from '../util/helper';

@Injectable()
export class CustomEventTitleFormatter extends CalendarEventTitleFormatter {
  constructor(private translate: TranslateService) {
    super();
  }

  private static eventTitle(event: CalendarEvent, locale: string): string {
    const meta: IMeta = event.meta;
    if (meta.time) {
      const timeZone = meta.timeZone;
      const start = formatDateMonth(event.start, locale);
      const end = event.end ? ` - ${formatDateMonth(event.end, locale)}` : '';
      if (!isSameTimeZone(timeZone)) {
        const tz = getTimeZone(timeZone);
        const startTimeZone = formatDateMonth(newDateTimestamp(dateToTimestamp(event.start), timeZone), locale);
        const endTimeZone = event.end ? ` - ${formatDateMonth(newDateTimestamp(dateToTimestamp(event.end), timeZone), locale)}` : '';
        return `<b>${start}${end}</b><br><b>${startTimeZone}${endTimeZone} ${tz.gmt}</b> ${event.title}`;
      }
      return `<b>${start}${end}</b> ${event.title}`;
    }
    return event.title;
  }

  month(event: CalendarEvent): string {
    const meta: IMeta = event.meta;
    if (meta.time) {
      if (!event.end) {
        return `<b>${this.translate.instant('COMMON.ALL_DAY.CHECK')}</b> ${event.title}`;
      }
      return CustomEventTitleFormatter.eventTitle(event, this.translate.currentLang);
    } else {
      return event.title;
    }
  }

  week(event: CalendarEvent): string {
    let result = CustomEventTitleFormatter.eventTitle(event, this.translate.currentLang);
    if (event.meta.state) {
      result = `<div class="material-icons">
        ${ReservationIconName[snakeToCamel(event.meta.state) as ReservationIconKey]}
      </div>&nbsp; ${result}`;
    }
    return result;
  }

  day(event: CalendarEvent): string {
    return CustomEventTitleFormatter.eventTitle(event, this.translate.currentLang);
  }
}
