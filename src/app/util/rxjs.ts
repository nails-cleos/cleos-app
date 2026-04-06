import { HttpErrorResponse } from '@angular/common/http';
import { Action } from '@ngrx/store';
import {
  from,
  isObservable,
  Observable,
  ObservableInput,
  of,
  OperatorFunction,
  throwError,
  timer,
} from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

export const genericRetryStrategy = (
  {
    scalingDuration = 1000,
    excludedStatusCodes = [0, 400, 401, 403, 404, 409, 412],
  }: {
    maxRetryAttempts?: number;
    scalingDuration?: number;
    excludedStatusCodes?: number[];
  }) => (error: any, attempts: number) => {
  const retryAttempt = attempts + 1;
  if (excludedStatusCodes.includes(error?.status)) {
    return throwError(() => error);
  }
  return timer(retryAttempt * scalingDuration);
};

type FailureActionCreator<TFailureAction extends Action> =
  (props: { error: any }) => TFailureAction;

type EffectSuccess<TAction extends Action> =
  | TAction
  | TAction[]
  | ObservableInput<TAction>;

const normalizeEffectSuccess = <TAction extends Action>(result: EffectSuccess<TAction>): Observable<TAction> => {
  if (Array.isArray(result) || isObservable(result)) {
    return from(result as ObservableInput<TAction>);
  }

  return of(result as TAction);
};

const handleFailure = <TAction extends Action, TFailureAction extends Action>(
  onFailure: FailureActionCreator<TFailureAction>,
) : OperatorFunction<TAction, TAction | TFailureAction> => catchError(
    (err: HttpErrorResponse) => of(onFailure({ error: err.error })),
  );

export const effectRequest = <TResponse, TAction extends Action, TFailureAction extends Action>(
  request$: Observable<TResponse>,
  onSuccess: (response: TResponse) => EffectSuccess<TAction>,
  onFailure: FailureActionCreator<TFailureAction>,
): Observable<Action> => request$.pipe(
    mergeMap(response => normalizeEffectSuccess(onSuccess(response))),
    handleFailure<TAction, TFailureAction>(onFailure),
  );
