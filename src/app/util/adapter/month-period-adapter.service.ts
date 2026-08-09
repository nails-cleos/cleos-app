import { inject, Injectable } from '@angular/core';
import {
  DateRange,
  MatDateRangeSelectionStrategy,
} from '@angular/material/datepicker';
import { DateAdapter } from '@angular/material/core';

@Injectable()
export class MonthPeriodAdapter<D> implements MatDateRangeSelectionStrategy<D> {
  private readonly dateAdapter: DateAdapter<D> = inject(DateAdapter);

  constructor() {}

  selectionFinished = (date: D | null): DateRange<D> =>
    this.createPeriodRange(date);

  createPreview = (activeDate: D | null): DateRange<D> =>
    this.createPeriodRange(activeDate);

  private createPeriodRange = (date: D | null): DateRange<D> => {
    if (date) {
      const year = this.dateAdapter.getYear(date);
      const month = this.dateAdapter.getMonth(date);
      const lastDay = this.dateAdapter.getNumDaysInMonth(date);

      const start = this.dateAdapter.createDate(year, month, 1);
      const end = this.dateAdapter.createDate(year, month, lastDay);
      return new DateRange<D>(start, end);
    }

    return new DateRange<D>(null, null);
  };
}
