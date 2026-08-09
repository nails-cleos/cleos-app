import { NativeDateAdapter } from '@angular/material/core';
import { DEFAULT_LOCALE } from '../dates';

export abstract class CustomDateAdapter extends NativeDateAdapter {
  protected constructor() {
    super();
  }

  parse = (value: any): Date | null => {
    if (typeof value === 'string' && value.indexOf('/') > -1) {
      const str = value.split('/');

      const year = Number(str[2]);
      const month = Number(str[1]) - 1;
      const date = Number(str[0]);

      return new Date(year, month, date);
    }

    const timestamp = typeof value === 'number' ? value : Date.parse(value);
    return isNaN(timestamp) ? null : new Date(timestamp);
  };

  formatDate(date: Date, displayFormat: any): string {
    date = new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
      ),
    );

    const dtf = new Intl.DateTimeFormat(
      this.locale || DEFAULT_LOCALE,
      displayFormat,
    );
    return dtf.format(date);
  }
}
