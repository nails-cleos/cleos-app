import { FilterByPipe } from './filterBy.pipe';
import { describe, expect, it } from 'vitest';

describe('FilterByPipe', () => {
  const pipe = new FilterByPipe();

  const items = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Alice' },
  ];

  it('should filter by a single primitive value', () => {
    const result = pipe.transform(items, 'Alice', 'name');
    expect(result).toEqual([
      { id: 1, name: 'Alice' },
      { id: 3, name: 'Alice' },
    ]);
  });

  it('should filter by an array of values', () => {
    const result = pipe.transform(items, ['Alice', 'Bob'], 'name');
    expect(result).toEqual(items);
  });

  it('should return original items when filter is falsy', () => {
    const result = pipe.transform(items, undefined);
    expect(result).toBe(items);
  });
});
