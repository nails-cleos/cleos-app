import { DurationTimePipe } from './durationTime.pipe';
import { describe, expect, it } from 'vitest';

describe('DurationTimePipe', () => {
  it('create an instance', () => {
    const pipe = new DurationTimePipe();
    expect(pipe).toBeTruthy();
  });
});
