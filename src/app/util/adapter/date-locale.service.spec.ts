import { TestBed } from '@angular/core/testing';
import { DateAdapter } from '@angular/material/core';
import { DateLocaleService } from './date-locale.service';
import { DEFAULT_LOCALE, LOCALE_MAP } from '../dates';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('DateLocaleService', () => {
  let service: DateLocaleService;

  const dateAdapterMock = {
    setLocale: vi.fn().mockName('setLocale'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DateLocaleService,
        { provide: DateAdapter, useValue: dateAdapterMock },
      ],
    });

    service = TestBed.inject(DateLocaleService);
    dateAdapterMock.setLocale.mockClear();
  });

  it('should map "nl" to locale and call setLocale', () => {
    service.setLanguage('nl');

    expect(dateAdapterMock.setLocale).toHaveBeenCalledWith(LOCALE_MAP['nl']);
  });

  it('should map "es" to locale and call setLocale', () => {
    service.setLanguage('es');

    expect(dateAdapterMock.setLocale).toHaveBeenCalledWith(LOCALE_MAP['es']);
  });

  it('should normalize "en-GB" to "en" and map correctly', () => {
    service.setLanguage('en-GB');

    expect(dateAdapterMock.setLocale).toHaveBeenCalledWith(LOCALE_MAP['en']);
  });

  it('should fallback to DEFAULT_LOCALE when language is undefined', () => {
    service.setLanguage(undefined);

    expect(dateAdapterMock.setLocale).toHaveBeenCalledWith(DEFAULT_LOCALE);
  });

  it('should fallback to DEFAULT_LOCALE when language is empty string', () => {
    service.setLanguage('');

    expect(dateAdapterMock.setLocale).toHaveBeenCalledWith(DEFAULT_LOCALE);
  });

  it('should normalize and strip region part (es-ES -> es)', () => {
    service.setLanguage('es-ES');

    expect(dateAdapterMock.setLocale).toHaveBeenCalledWith(LOCALE_MAP['es']);
  });
});
