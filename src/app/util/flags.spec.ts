import { findFlag, flags } from './flags';
import { flagEs, flagGb, flagNl } from '@ng-icons/flag-icons';
import { describe, expect, it } from 'vitest';

describe('Flags Utils', () => {
  describe('flags', () => {
    it('should return a list of IFlag objects', () => {
      const list = flags();
      expect(list.length).toBeGreaterThan(0);
      list.forEach((flag) => {
        expect(flag.icon).toBeDefined();
        expect(flag.value).toBeDefined();
        expect(flag.text).toBeDefined();
        expect(flag.flag).toBeDefined();
      });
    });

    it('should include ES, GB, and NL flags', () => {
      const list = flags();
      expect(list.find((f) => f.value === 'es')?.flag).toBe(flagEs);
      expect(list.find((f) => f.value === 'en_GB')?.flag).toBe(flagGb);
      expect(list.find((f) => f.value === 'nl')?.flag).toBe(flagNl);
    });
  });

  describe('findFlag', () => {
    it('should find flag by exact value', () => {
      const result = findFlag('es');
      expect(result.value).toBe('es');
    });

    it('should fallback to locale from getLocale if exact match not found', () => {
      const result = findFlag('fr');
      expect(result.value).toBe('en_GB');
    });

    it('should resolve dutch locales through getLocale fallback', () => {
      const result = findFlag('nl-NL');
      expect(result.value).toBe('nl');
    });

    it('should fallback to navigator.language if still not found', () => {
      const originalLang = navigator.language;
      Object.defineProperty(navigator, 'language', {
        value: 'es',
        configurable: true,
      });
      const result = findFlag('unknown_lang');
      expect(result.value).toBe('en_GB');
      Object.defineProperty(navigator, 'language', { value: originalLang });
    });
  });
});
