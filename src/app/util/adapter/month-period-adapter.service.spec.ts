import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DateRange } from '@angular/material/datepicker';
import { DateAdapter } from '@angular/material/core';

import { MonthPeriodAdapter } from './month-period-adapter.service';

describe('MonthPeriodAdapter', () => {
  let adapter: MonthPeriodAdapter<Date>;

  let dateAdapterMock: {
    setLocale: ReturnType<typeof vi.fn>;
    getYear: ReturnType<typeof vi.fn>;
    getMonth: ReturnType<typeof vi.fn>;
    getNumDaysInMonth: ReturnType<typeof vi.fn>;
    createDate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    dateAdapterMock = {
      setLocale: vi.fn(),
      getYear: vi.fn(),
      getMonth: vi.fn(),
      getNumDaysInMonth: vi.fn(),
      createDate: vi.fn(),
    };

    dateAdapterMock.createDate.mockImplementation(
      (year: number, month: number, day: number) => new Date(year, month, day),
    );

    TestBed.configureTestingModule({
      providers: [
        MonthPeriodAdapter,
        {
          provide: DateAdapter,
          useValue: dateAdapterMock,
        },
      ],
    });

    adapter = TestBed.inject(MonthPeriodAdapter);
  });

  it('should create full month range from a selected date', () => {
    const selectedDate = new Date(2026, 6, 20);

    dateAdapterMock.getYear.mockReturnValue(2026);
    dateAdapterMock.getMonth.mockReturnValue(6);
    dateAdapterMock.getNumDaysInMonth.mockReturnValue(31);

    const range = adapter.selectionFinished(selectedDate);

    expect(range.start).toEqual(new Date(2026, 6, 1));
    expect(range.end).toEqual(new Date(2026, 6, 31));
  });

  it('should return an empty preview range when active date is null', () => {
    const range = adapter.createPreview(null);

    expect(range).toEqual(new DateRange<Date>(null, null));
  });
});
