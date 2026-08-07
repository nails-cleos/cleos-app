import { Injectable } from '@angular/core';
import { CustomDateAdapter } from './custom-date-adapter';

@Injectable()
export class YearAdapter extends CustomDateAdapter {

  constructor() {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  format = (date: Date, _displayFormat: any): string => super.formatDate(date, { year: 'numeric' });
}
