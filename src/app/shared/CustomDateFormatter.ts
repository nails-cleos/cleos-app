import { CalendarNativeDateFormatter, DateFormatterParams } from 'angular-calendar';
import { columnHeader, dayViewTitle, formatDateHourMinute, monthViewTitle } from '../util/dates';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomDateFormatter extends CalendarNativeDateFormatter {

  public monthViewTitle({date, locale}: DateFormatterParams): string {
    return monthViewTitle(date, locale);
  }

  public monthViewColumnHeader({date, locale}: DateFormatterParams): string {
    return columnHeader(date, locale);
  }

  public weekViewColumnHeader({date, locale}: DateFormatterParams): string {
    return columnHeader(date, locale);
  }

  public weekViewHour({date, locale}: DateFormatterParams): string {
    return formatDateHourMinute(date, locale);
  }

  public dayViewTitle({date, locale}: DateFormatterParams): string {
    return dayViewTitle(date, locale);
  }

  public dayViewHour({date, locale}: DateFormatterParams): string {
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  }
}
