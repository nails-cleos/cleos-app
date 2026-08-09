import {
  CalendarNativeDateFormatter,
  DateFormatterParams,
} from 'angular-calendar';
import {
  columnHeader,
  dayViewTitle,
  formatDateHourMinute,
  monthViewTitle,
} from '../util/dates';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomDateFormatter extends CalendarNativeDateFormatter {
  monthViewTitle = ({ date, locale }: DateFormatterParams): string =>
    monthViewTitle(date, locale);

  monthViewColumnHeader = ({ date, locale }: DateFormatterParams): string =>
    columnHeader(date, locale);

  weekViewColumnHeader = ({ date, locale }: DateFormatterParams): string =>
    columnHeader(date, locale);

  weekViewHour = ({ date, locale }: DateFormatterParams): string =>
    formatDateHourMinute(date, locale);

  dayViewTitle = ({ date, locale }: DateFormatterParams): string =>
    dayViewTitle(date, locale);

  dayViewHour = ({ date, locale }: DateFormatterParams): string =>
    new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
}
