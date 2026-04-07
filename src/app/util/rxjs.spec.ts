import { HttpErrorResponse } from '@angular/common/http';
import { fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { effectRequest, genericRetryStrategy } from './rxjs';

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

describe('effectRequest', () => {
  it('should map the success value into an action', (done: DoneFn) => {
    effectRequest(
      of(5),
      count => ({ type: '[Test] Success', count }),
      ({ error }) => ({ type: '[Test] Failure', error }),
    ).subscribe(action => {
      expect(action).toEqual(jasmine.objectContaining({ type: '[Test] Success', count: 5 }));
      done();
    });
  });

  it('should emit each action when success returns an array', () => {
    const emitted: Array<{ type: string; value?: number }> = [];

    effectRequest(
      of([1, 2]),
      values => values.map(value => ({ type: '[Test] Success', value })),
      ({ error }) => ({ type: '[Test] Failure', error }),
    ).subscribe(action => emitted.push(action as { type: string; value?: number }));

    expect(emitted).toEqual([
      { type: '[Test] Success', value: 1 },
      { type: '[Test] Success', value: 2 },
    ]);
  });

  it('should map HttpErrorResponse.error into the provided failure action', (done: DoneFn) => {
    const error = { message: 'boom' };

    effectRequest(
      throwError(() => new HttpErrorResponse({ error, status: 400 })),
      value => ({ type: '[Test] Success', value }),
      ({ error: mappedError }) => ({ type: '[Test] Failure', error: mappedError }),
    ).subscribe(action => {
      expect(action).toEqual(jasmine.objectContaining({ type: '[Test] Failure', error }));
      done();
    });
  });
});
