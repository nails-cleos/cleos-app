import { DateAdapter } from '@angular/material/core';
import { inject, Injectable } from '@angular/core';
import { DEFAULT_LOCALE, LOCALE_MAP } from '../dates';

@Injectable({
  providedIn: 'root',
})
export class DateLocaleService {
  private readonly dateAdapter = inject(DateAdapter<Date>);

  setLanguage(lang?: string) {
    this.dateAdapter.setLocale(this.normalizeLocale(lang));
  }

  private normalizeLocale(lang?: string): string {
    if (!lang) {
      return DEFAULT_LOCALE;
    }

    const key = lang
      .toLowerCase()
      .replace(/[^a-z-]/g, '')
      .split('-')[0];

    return LOCALE_MAP[key] ?? DEFAULT_LOCALE;
  }
}
