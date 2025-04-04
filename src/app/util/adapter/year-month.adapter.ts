import { Injectable } from '@angular/core';
import { DateAdapter } from './date.adapter';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class YearMonthAdapter extends DateAdapter {

  constructor(readonly translate: TranslateService) {
    super(translate.currentLang);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  format = (date: Date, _displayFormat: any): string => super.formatDate(date, { year: 'numeric', month: 'long' });
}
