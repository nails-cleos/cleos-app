import { DiscountPipe } from './discount.pipe';
import { DiscountType } from '../discount/discount';
import { describe, expect, it } from 'vitest';

describe('DiscountPipe', () => {
  const pipe = new DiscountPipe();

  it('should format percentage discount', () => {
    expect(pipe.transform(DiscountType.percentage, 15)).toBe('15%');
  });

  it('should format money discount with currency symbol', () => {
    expect(pipe.transform(DiscountType.money, 20, 'EUR')).toBe('€ 20');
  });

  it('should return value as string when type is undefined', () => {
    expect(pipe.transform(undefined, 5)).toBe('5');
  });
});
