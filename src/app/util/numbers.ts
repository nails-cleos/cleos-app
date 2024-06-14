import { API_LOCALE } from './dates';
import { ICurrency } from '../interfaces/currency';

export const numberFormat = (value: number | string, currency?: ICurrency, locale: string = API_LOCALE) => new Intl.NumberFormat(locale,
  currency ? { maximumFractionDigits: 2, currency: currency.code, style: 'currency' } : { maximumFractionDigits: 2 }).format(Number(value));

export const closest = (goal: number, counts: number[] = [0, 15, 30, 45]): number => counts
  .reduce((prev, curr) => (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev));
