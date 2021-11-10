import { Observable, throwError, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

type ShouldRetryFn = ({status}: any) => boolean;

interface RetryParams {
  maxAttempts: number;
  scalingDuration: number;
  shouldRetry: ShouldRetryFn;
}

const defaultParams: RetryParams = {
  maxAttempts: 3,
  scalingDuration: 1000,
  shouldRetry: ({status}) => status >= 500 || status === 0
};

export const genericRetryStrategy = () => (attempts: Observable<any>) => attempts.pipe(
  mergeMap((error, i) => {
    const {maxAttempts, scalingDuration, shouldRetry} = defaultParams;
    const retryAttempt = i + 1;
    if (retryAttempt > maxAttempts || !shouldRetry(error)) {
      return throwError(error);
    }
    return timer(retryAttempt * scalingDuration);
  })
);
