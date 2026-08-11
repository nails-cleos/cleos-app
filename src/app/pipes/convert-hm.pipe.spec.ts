import { ConvertHMPipe } from './convert-hm.pipe';
import { beforeEach, describe, expect, it } from 'vitest';

describe('ConvertHMPipe', () => {
  let pipe: ConvertHMPipe;

  beforeEach(() => {
    pipe = new ConvertHMPipe();
  });

  it('should create the pipe', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "00:00" for undefined or 0', () => {
    expect(pipe.transform()).toBe('00:00');
    expect(pipe.transform(0)).toBe('00:00');
  });

  it('should convert seconds to HH:MM', () => {
    // Example: 3600 seconds = 1 hour
    expect(pipe.transform(3600)).toBe('01:00');
    // 3661 seconds = 1:01
    expect(pipe.transform(3661)).toBe('01:01');
    // 90 seconds = 0:01 (depends on your secondsToHHMM implementation)
    expect(pipe.transform(90)).toBe('00:01');
  });
});
