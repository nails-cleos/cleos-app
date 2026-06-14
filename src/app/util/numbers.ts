import { DEFAULT_LOCALE } from './dates';
import { ICurrency } from '../currency/currency';

export const numberFormat = (
  value: number | string,
  currency?: ICurrency,
  locale: string = DEFAULT_LOCALE,
) => new Intl.NumberFormat(locale, currency ? { maximumFractionDigits: 2, currency: currency.code, style: 'currency' } :
  { maximumFractionDigits: 2 }).format(Number(value));

export const closest = (goal: number, counts: number[] = [0, 15, 30, 45]): number => counts
  .reduce((prev, curr) => (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev));

export const calculateNet = (gross: number, btw: number): number => (gross / (btw + 100) * 100);

export const calculateBTW = (total: number, subtotal: number): number => ((total - subtotal) / subtotal) * 100;
