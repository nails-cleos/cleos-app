import { Injectable } from '@angular/core';
import { DateRange, MatDateRangeSelectionStrategy } from '@angular/material/datepicker';
import { DateAdapter } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class QuarterPeriodAdapter<D> implements MatDateRangeSelectionStrategy<D> {
  constructor(private readonly translate: TranslateService, private dateAdapter: DateAdapter<D>) {
    this.dateAdapter.setLocale(translate.currentLang);
  }

  selectionFinished(date: D | null): DateRange<D> {
    return this.createPeriodRange(date);
  }

  createPreview(activeDate: D | null): DateRange<D> {
    return this.createPeriodRange(activeDate);
  }

  private createPeriodRange(date: D | null): DateRange<D> {
    if (date) {
      const year = this.dateAdapter.getYear(date);
      const month = this.dateAdapter.getMonth(date);
      const lastDay = this.dateAdapter.getNumDaysInMonth(date);

      let startMonth = month - 2;
      let startYear = year;
      if (startMonth < 0) {
        startMonth += 12;
        startYear -= 1;
      }

      const start = this.dateAdapter.createDate(startYear, startMonth, 1);
      const end = this.dateAdapter.createDate(year, month, lastDay);
      return new DateRange<D>(start, end);
    }

    return new DateRange<D>(null, null);
  }
}
