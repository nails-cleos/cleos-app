import { CustomDateFormatter } from './CustomDateFormatter';
import { TestBed } from '@angular/core/testing';
import { NativeDateAdapter } from '@angular/material/core';
import { DateAdapter } from 'angular-calendar';
import { DEFAULT_LOCALE } from '../util/dates';
import { beforeEach, describe, expect, it } from 'vitest';

describe('CustomDateFormatter', () => {
  let formatter: CustomDateFormatter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CustomDateFormatter,
        { provide: DateAdapter, useClass: NativeDateAdapter },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    });

    formatter = TestBed.inject(CustomDateFormatter);
  });

  describe('monthViewTitle', () => {
    it('should format month and year', () => {
      const date = new Date(2024, 0, 1);
      const title = formatter.monthViewTitle({ date, locale: DEFAULT_LOCALE });
      expect(title).toContain('2024');
      expect(title.charAt(0)).toBe(title.charAt(0).toUpperCase());
    });
  });

  describe('monthViewColumnHeader', () => {
    it('should format weekday name', () => {
      const date = new Date(2024, 0, 1); // Monday
      const header = formatter.monthViewColumnHeader({
        date,
        locale: DEFAULT_LOCALE,
      });
      expect(header).toBe('Monday');
      expect(header.charAt(0)).toBe(header.charAt(0).toUpperCase());
    });
  });

  describe('weekViewColumnHeader', () => {
    it('should format weekday name', () => {
      const date = new Date(2024, 0, 1); // Monday
      const header = formatter.weekViewColumnHeader({
        date,
        locale: DEFAULT_LOCALE,
      });
      expect(header).toBe('Monday');
      expect(header.charAt(0)).toBe(header.charAt(0).toUpperCase());
    });
  });

  describe('weekViewHour', () => {
    it('should format hour and minute', () => {
      const date = new Date(2024, 0, 1, 14, 30);
      const formatted = formatter.weekViewHour({
        date,
        locale: DEFAULT_LOCALE,
      });
      expect(formatted).toBe('14:30');
      expect(formatted.charAt(0)).toBe(formatted.charAt(0).toUpperCase());
    });
  });

  describe('dayViewTitle', () => {
    it('should format day view title', () => {
      const date = new Date(2024, 0, 1);
      const title = formatter.dayViewTitle({ date, locale: DEFAULT_LOCALE });
      expect(title).toBe('Monday, 1 January 2024');
      expect(title.charAt(0)).toBe(title.charAt(0).toUpperCase());
    });
  });

  describe('dayViewHour', () => {
    it('should format date to hour and minute in given locale', () => {
      const date = new Date('2024-01-01T13:30:00');

      const result = formatter.dayViewHour({ date, locale: DEFAULT_LOCALE });

      expect(result).toBe(
        new Intl.DateTimeFormat(DEFAULT_LOCALE, {
          hour: 'numeric',
          minute: 'numeric',
        }).format(date),
      );
    });

    it('should respect different locales', () => {
      const date = new Date('2024-01-01T13:30:00');

      const en = formatter.dayViewHour({ date, locale: 'en-US' });
      const nl = formatter.dayViewHour({ date, locale: 'nl-NL' });

      expect(en).not.toBe(nl);
    });
  });
});
