import { closest, numberFormat } from './numbers';
import { ICurrency } from '../currency/currency';
import { DEFAULT_LOCALE } from './dates';

describe('Number Utils', () => {

  describe('numberFormat', () => {

    it('should format a number without currency', () => {
      expect(numberFormat(1234.567))
        .toBe(new Intl.NumberFormat(DEFAULT_LOCALE, { maximumFractionDigits: 2 }).format(1234.567));
    });

    it('should format a string number without currency', () => {
      expect(numberFormat('9876.543'))
        .toBe(new Intl.NumberFormat(DEFAULT_LOCALE, { maximumFractionDigits: 2 }).format(9876.543));
    });

    it('should format a number with currency', () => {
      const currency: ICurrency = { code: 'USD' };
      const formatted = numberFormat(1234.567, currency);
      const expected = new Intl.NumberFormat(DEFAULT_LOCALE,
        { maximumFractionDigits: 2, currency: 'USD', style: 'currency' }).format(1234.567);
      expect(formatted).toBe(expected);
    });

    it('should use the provided locale', () => {
      const currency: ICurrency = { code: 'EUR' };
      const locale = 'de-DE';
      const formatted = numberFormat(1234.567, currency, locale);
      const expected = new Intl.NumberFormat(locale,
        { maximumFractionDigits: 2, currency: 'EUR', style: 'currency' }).format(1234.567);
      expect(formatted).toBe(expected);
    });

  });

  describe('closest', () => {

    it('should find the closest number in default array', () => {
      expect(closest(7)).toBe(0);   // closest to 7 in [0,15,30,45]
      expect(closest(20)).toBe(15);
      expect(closest(31)).toBe(30);
      expect(closest(46)).toBe(45);
    });

    it('should use a custom counts array', () => {
      expect(closest(7, [1, 5, 10])).toBe(5);
      expect(closest(8, [1, 5, 10])).toBe(10);
    });
  });
});
