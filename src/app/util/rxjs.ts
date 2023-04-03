import { Observable, throwError, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

interface RetryParams {
  maxAttempts: number;
  scalingDuration: number;
  excludedStatusCodes: [];
}

export const genericRetryStrategy = ({
    maxRetryAttempts = 3,
    scalingDuration = 1000,
    excludedStatusCodes = []
  }: {
  maxRetryAttempts?: number,
  scalingDuration?: number,
  excludedStatusCodes?: number[]
} = {}) => (attempts: Observable<any>) => attempts.pipe(
  mergeMap((error, i) => {
    const retryAttempt = i + 1;
    if (retryAttempt > maxRetryAttempts || excludedStatusCodes.find(e => e === error.status)) {
      return throwError(error);
    }
    return timer(retryAttempt * scalingDuration);
  })
);
