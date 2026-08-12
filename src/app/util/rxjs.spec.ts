import { describe, expect, it, vi } from 'vitest';
import { genericRetryStrategy } from './rxjs';

describe('genericRetryStrategy', () => {
  it('should rethrow excluded status codes', async () => {
    const error = { status: 400, statusText: 'Bad Request' };
    const delaySelector = genericRetryStrategy({});

    await expect(
      new Promise((_, reject) => {
        delaySelector(error, 0).subscribe({
          next: () => reject(new Error('Expected stream to error')),
          error: (err) => reject(err),
        });
      }),
    ).rejects.toBe(error);
  });

  it('should delay retries based on attempt number and scaling duration', () => {
    vi.useFakeTimers();

    try {
      const delaySelector = genericRetryStrategy({
        scalingDuration: 50,
        excludedStatusCodes: [418],
      });

      let emitted = false;

      delaySelector({ status: 500 }, 2).subscribe(() => {
        emitted = true;
      });

      vi.advanceTimersByTime(149);
      expect(emitted).toBe(false);

      vi.advanceTimersByTime(1);
      expect(emitted).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
