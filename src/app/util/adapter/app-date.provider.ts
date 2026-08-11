import { Provider } from '@angular/core';
import {
  DateAdapter as MaterialDateAdapter,
  MAT_DATE_FORMATS,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { YearMonthDateAdapter } from './year-month-date.adapter';
import { YearMonthAdapter } from './year-month.adapter';
import { YearAdapter } from './year.adapter';
import { MonthPeriodAdapter } from './month-period-adapter.service';
import {
  CalendarDateFormatter,
  CalendarEventTitleFormatter,
  DateAdapter as CalendarDateAdapter,
  provideCalendar,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CustomDateFormatter } from '@app/shared/CustomDateFormatter';
import { CustomEventTitleFormatter } from '@app/shared/CustomEventTitleFormatter';

const YEAR_MONTH_FORMATS = {
  parse: {
    dateInput: { year: 'numeric', month: 'long' },
  },
  display: {
    dateInput: { year: 'numeric', month: 'long' },
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

const YEAR_FORMATS = {
  parse: {
    dateInput: { year: 'numeric' },
  },
  display: {
    dateInput: { year: 'numeric' },
    monthYearLabel: { year: 'numeric' },
    dateA11yLabel: { year: 'numeric' },
    monthYearA11yLabel: { year: 'numeric' },
  },
};

export const provideAppDateAdapter = () => [
  ...provideNativeDateAdapter(),
  {
    provide: MaterialDateAdapter,
    useClass: YearMonthDateAdapter,
  },
];

export const provideAppCalendar = () =>
  provideCalendar(
    {
      provide: CalendarDateAdapter,
      useFactory: adapterFactory,
    },
    {
      dateFormatter: {
        provide: CalendarDateFormatter,
        useClass: CustomDateFormatter,
      },
      eventTitleFormatter: {
        provide: CalendarEventTitleFormatter,
        useClass: CustomEventTitleFormatter,
      },
    },
  );

export const provideYearMonthDateAdapter = (): Provider[] => [
  {
    provide: MaterialDateAdapter,
    useClass: YearMonthAdapter,
  },
  {
    provide: MAT_DATE_FORMATS,
    useValue: YEAR_MONTH_FORMATS,
  },
];

export const provideYearDateAdapter = (): Provider[] => [
  {
    provide: MaterialDateAdapter,
    useClass: YearAdapter,
  },
  {
    provide: MAT_DATE_FORMATS,
    useValue: YEAR_FORMATS,
  },
];

export const provideMonthPeriodAdapter = (): Provider[] => [
  {
    provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
    useClass: MonthPeriodAdapter,
  },
];
