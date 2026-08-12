import { SortByPipe } from './sort-by.pipe';
import { describe, expect, it } from 'vitest';

describe('SortByPipe', () => {
  const pipe = new SortByPipe();

  const numbers = [3, 1, 2];
  const objects = [
    { id: 2, name: 'B' },
    { id: 1, name: 'A' },
    { id: 3, name: 'C' },
  ];

  it('should return original value when value is null or undefined', () => {
    expect(pipe.transform(null, 'asc')).toBeNull();
    expect(pipe.transform(undefined, 'asc')).toBeUndefined();
  });

  it('should return original value when order is empty', () => {
    expect(pipe.transform(numbers, '')).toBe(numbers);
  });

  it('should sort numbers ascending when no column provided', () => {
    const result = pipe.transform([...numbers], 'asc');
    expect(result).toEqual([1, 2, 3]);
  });

  it('should sort numbers descending when no column provided', () => {
    const result = pipe.transform([...numbers], 'desc');
    expect(result).toEqual([3, 2, 1]);
  });

  it('should sort objects by column ascending', () => {
    const result = pipe.transform([...objects], 'asc', 'id');
    expect(result).toEqual([
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 3, name: 'C' },
    ]);
  });

  it('should sort objects by column descending', () => {
    const result = pipe.transform([...objects], 'desc', 'id');
    expect(result).toEqual([
      { id: 3, name: 'C' },
      { id: 2, name: 'B' },
      { id: 1, name: 'A' },
    ]);
  });
});
