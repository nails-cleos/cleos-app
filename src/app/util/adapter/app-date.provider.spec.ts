import { TestBed } from '@angular/core/testing';
import { DateAdapter as MaterialDateAdapter } from '@angular/material/core';
import { DateAdapter as CalendarDateAdapter } from 'angular-calendar';
import { provideAppCalendar, provideAppDateAdapter } from './app-date.provider';
import { TranslateModule } from '@ngx-translate/core';

describe('app-date.provider', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideAppDateAdapter(),
        provideAppCalendar(),
      ],
    });
  });

  it('keeps the Angular Material date adapter separate from the calendar adapter', () => {
    const materialAdapter = TestBed.inject(MaterialDateAdapter);
    const calendarAdapter = TestBed.inject(CalendarDateAdapter);

    expect(typeof materialAdapter.setLocale).toBe('function');
    expect(calendarAdapter).not.toBe(materialAdapter as unknown as CalendarDateAdapter);
  });
});
