import { fakeAsync, tick } from '@angular/core/testing';

import { genericRetryStrategy } from './rxjs';

describe('genericRetryStrategy', () => {
  it('should rethrow excluded status codes', (done: DoneFn) => {
    const error = { status: 0, statusText: 'Offline' };
    const delaySelector = genericRetryStrategy({});

    delaySelector(error, 0).subscribe({
      next: () => done.fail('Expected stream to error'),
      error: err => {
        expect(err).toBe(error);
        done();
      },
    });
  });

  it('should delay retries based on attempt number and scaling duration', fakeAsync(() => {
    const delaySelector = genericRetryStrategy({ scalingDuration: 50, excludedStatusCodes: [418] });
    let emitted = false;

    delaySelector({ status: 500 }, 2).subscribe(() => {
      emitted = true;
    });

    tick(149);
    expect(emitted).toBeFalse();

    tick(1);
    expect(emitted).toBeTrue();
  }));
});
