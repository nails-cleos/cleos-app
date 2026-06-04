import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { IAwsExtract } from '../interfaces/aws';
import { AwsLambdaService } from '../services/aws-lambda.service';
import { createStoreInitialState, mapCrudHttpError, StoreState } from './crud-signal-store';

type AwsStoreState = Pick<StoreState<IAwsExtract>, 'data' | 'error' | 'isLoading'>;

const initialState: AwsStoreState = {
  ...createStoreInitialState<IAwsExtract, never>(),
};

export const AwsStore = signalStore(
  withState(initialState),
  withMethods((store, awsLambdaService = inject(AwsLambdaService)) => ({
    clean(): void {
      patchState(store, initialState);
    },

    clearError(): void {
      patchState(store, { error: undefined });
    },

    processPdf(token: string, file: File, userId?: string): void {
      patchState(store, {
        data: {} as IAwsExtract,
        error: undefined,
        isLoading: true,
      });

      awsLambdaService.processPdf(token, file, userId).subscribe({
        next: (data) => patchState(store, {
          data,
          error: undefined,
          isLoading: false,
        }),
        error: (err) => patchState(store, {
          error: mapCrudHttpError(err),
          isLoading: false,
        }),
      });
    },
  })),
);
