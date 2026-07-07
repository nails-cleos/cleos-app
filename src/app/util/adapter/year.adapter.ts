import { Inject, Injectable } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { CustomDateAdapter } from './custom-date-adapter';

@Injectable()
export class YearAdapter extends CustomDateAdapter {

  constructor(@Inject(MAT_DATE_LOCALE) locale: string) {
    super(locale);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  format = (date: Date, _displayFormat: any): string => super.formatDate(date, { year: 'numeric' });
}
