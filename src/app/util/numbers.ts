import { API_LOCALE } from './dates';
import { ICurrency } from '../interfaces/currency';
import { currencySymbol } from './helper';

export const numberFormat = (value: number | string, currency?: ICurrency, locale: string = API_LOCALE) => {
  const options = currency ? { maximumFractionDigits: 2, currency: currency.code, style: 'currency' } : { maximumFractionDigits: 2 };

  if (typeof value === 'string') {
    return currency ? `${ currencySymbol(currency) }${ value }` : value;
  }

  return new Intl.NumberFormat(locale, options).format(Number(value));
};

export const twoDigitNumber = (value: number, locale: string = API_LOCALE) => value.toLocaleString(locale, {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2
});
