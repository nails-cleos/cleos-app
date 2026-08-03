import { Inject, Injectable } from '@angular/core';
import { CustomDateAdapter } from './custom-date-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';

@Injectable()
export class YearMonthDateAdapter extends CustomDateAdapter {

  constructor(@Inject(MAT_DATE_LOCALE) locale: string) {
    super(locale);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  format = (date: Date, _displayFormat: any): string => super.formatDate(
    date,
    { year: 'numeric', month: '2-digit', day: '2-digit' },
  );
}
