import { Injectable } from '@angular/core';
import { DateAdapter } from './date.adapter';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class YearMonthDateAdapter extends DateAdapter {

  constructor(private readonly translate: TranslateService) {
    super(translate.currentLang);
  }
  format(date: Date, displayFormat: any): string {
    return super.formatDate(date, { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
}
