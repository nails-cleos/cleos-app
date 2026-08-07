import { Injectable } from '@angular/core';
import { CustomDateAdapter } from './custom-date-adapter';

@Injectable()
export class YearMonthDateAdapter extends CustomDateAdapter {

  constructor() {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  format = (date: Date, _displayFormat: any): string => super.formatDate(
    date,
    { year: 'numeric', month: '2-digit', day: '2-digit' },
  );
}
