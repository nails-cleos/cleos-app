import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { IAwsExtract } from '../interfaces/aws';
import AwsLambdaService from '../services/aws-lambda.service';
import { createStoreInitialState, mapCrudHttpError, StoreState } from './crud-signal-store';
import type { Subscription } from 'rxjs';

type AwsStoreState = Pick<StoreState<IAwsExtract>, 'data' | 'error' | 'isLoading'>;

const initialState: AwsStoreState = {
  ...createStoreInitialState<IAwsExtract, never>(),
};

export const AwsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, awsLambdaService = inject(AwsLambdaService)) => {
    let processPdfSubscription: Subscription | undefined;

    const cancelAll = (): void => {
      processPdfSubscription?.unsubscribe();
    };

    return {
      clean(): void {
        cancelAll();
        patchState(store, initialState);
      },

      clearError(): void {
        patchState(store, { error: undefined });
      },

      processPdf(token: string, file: File, userId?: string): void {
        processPdfSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        processPdfSubscription = awsLambdaService.processPdf(token, file, userId).subscribe({
          next: (data) => patchState(store, { data, isLoading: false }),
          error: (err) => patchState(store, { error: mapCrudHttpError(err), isLoading: false }),
        });
      },
    };
  }),
);
