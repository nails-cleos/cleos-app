import { CalendarEvent, CalendarEventTitleFormatter } from 'angular-calendar';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { formatDateMonth } from '../util/dates';
import { IMeta } from '../util/event';

@Injectable()
export class CustomEventTitleFormatter extends CalendarEventTitleFormatter {
  constructor(private translate: TranslateService) {
    super();
  }

  month(event: CalendarEvent): string {
    const meta: IMeta = event.meta;
    if (meta.time) {
      if (event.end) {
        const start = formatDateMonth(event.start, this.translate.currentLang);
        const end = formatDateMonth(event.end, this.translate.currentLang);
        return `<b>${start} - ${end}</b> ${event.title}`;
      } else {
        return `<b>${this.translate.instant('COMMON.ALL_DAY.CHECK')}</b> ${event.title}`;
      }
    } else {
      return event.title;
    }
  }

  week(event: CalendarEvent): string {
    const meta: IMeta = event.meta;
    if (meta.time) {
      const end = event.end ? ` - ${formatDateMonth(event.end, this.translate.currentLang)}` : '';
      return `<b>${formatDateMonth(event.start, this.translate.currentLang)}${end}</b> ${
        event.title
      }`;
    } else {
      return event.title;
    }
  }

  day(event: CalendarEvent): string {
    const meta: IMeta = event.meta;
    if (meta.time) {
      const end = event.end ? ` - ${formatDateMonth(event.end, this.translate.currentLang)}` : '';
      return `<b>${formatDateMonth(event.start, this.translate.currentLang)}${end}</b> ${
        event.title
      }`;
    } else {
      return event.title;
    }
  }
}
