import { Type } from '@angular/core';
import { RouterNavigatedAction } from '@ngrx/router-store';
import { Action } from '@ngrx/store';
import { EMPTY, from, Observable, OperatorFunction } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AppRouterStateSnapshot } from './router-state.serializer';

type NavigationRunResult = Action | readonly Action[] | null | undefined;

type NavigationHandlers = {
  run: (action: RouterNavigatedAction<AppRouterStateSnapshot>,
        routerState: AppRouterStateSnapshot) => NavigationRunResult;
  onError?: (error: unknown) => NavigationRunResult;
};

export const navigation = (
  target: Type<unknown>,
  handlers: NavigationHandlers,
): OperatorFunction<RouterNavigatedAction<AppRouterStateSnapshot>, Action> => {
  return (source: Observable<RouterNavigatedAction<AppRouterStateSnapshot>>) => source.pipe(
    mergeMap((action: RouterNavigatedAction<AppRouterStateSnapshot>) => {
      try {
        const routerState = action.payload.routerState;
        if (routerState.activeComponent !== target) {
          return EMPTY;
        }

        return toActions(handlers.run(action, routerState));
      } catch (error) {
        return toActions(handlers.onError?.(error));
      }
    }),
  );
};

const toActions = (result: NavigationRunResult) => {
  if (!result) {
    return EMPTY;
  }

  return from(Array.isArray(result) ? result : [result]);
};
