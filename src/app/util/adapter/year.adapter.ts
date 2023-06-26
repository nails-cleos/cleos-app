import { Injectable } from '@angular/core';
import { DateAdapter } from './date.adapter';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class YearAdapter extends DateAdapter {

  constructor(private readonly translate: TranslateService) {
    super(translate.currentLang);
  }

  format(date: Date, displayFormat: any): string {
    return super.formatDate(date, { year: 'numeric' });
  }
}
