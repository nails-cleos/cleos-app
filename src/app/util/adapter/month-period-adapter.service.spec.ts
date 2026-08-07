import { DateRange } from '@angular/material/datepicker';
import { DateAdapter } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';

import { MonthPeriodAdapter } from './month-period-adapter.service';

describe('MonthPeriodAdapter', () => {
  let translateServiceMock: jasmine.SpyObj<TranslateService>;
  let dateAdapterMock: jasmine.SpyObj<DateAdapter<Date>>;
  let adapter: MonthPeriodAdapter<Date>;

  beforeEach(() => {
    translateServiceMock = jasmine.createSpyObj<TranslateService>('TranslateService', ['getCurrentLang']);
    translateServiceMock.getCurrentLang.and.returnValue('en-US');

    dateAdapterMock = jasmine.createSpyObj<DateAdapter<Date>>('DateAdapter', [
      'setLocale',
      'getYear',
      'getMonth',
      'getNumDaysInMonth',
      'createDate',
    ]);
    dateAdapterMock.createDate.and.callFake((year: number, month: number, day: number) => new Date(year, month, day));

    adapter = new MonthPeriodAdapter<Date>();
  });

  it('should create full month range from a selected date', () => {
    const selectedDate = new Date(2026, 6, 20);
    dateAdapterMock.getYear.and.returnValue(2026);
    dateAdapterMock.getMonth.and.returnValue(6);
    dateAdapterMock.getNumDaysInMonth.and.returnValue(31);

    const range = adapter.selectionFinished(selectedDate);

    expect(range.start).toEqual(new Date(2026, 6, 1));
    expect(range.end).toEqual(new Date(2026, 6, 31));
  });

  it('should return an empty preview range when active date is null', () => {
    const range = adapter.createPreview(null);

    expect(range).toEqual(new DateRange<Date>(null, null));
  });
});
