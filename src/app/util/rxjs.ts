import { throwError, timer } from 'rxjs';

export const genericRetryStrategy = ({ scalingDuration = 1000, excludedStatusCodes = [0, 400, 401, 403, 404, 409, 412] }: {
  maxRetryAttempts?: number;
  scalingDuration?: number;
  excludedStatusCodes?: number[];
}) => (error: any, attempts: number) => {
  const retryAttempt = attempts + 1;
  if (excludedStatusCodes.find(e => e === error.status)) {
    return throwError(error);
  }
  return timer(retryAttempt * scalingDuration);
};
