import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { IAwsExtract } from '../interfaces/aws';
import { IError } from '../interfaces/common';
import { AwsLambdaService } from '../services/aws-lambda.service';
import { mapCrudHttpError } from './crud-signal-store';

type AwsStoreState = {
  data: IAwsExtract | undefined;
  error: IError | undefined;
  isLoading: boolean;
};

const initialState: AwsStoreState = {
  data: undefined,
  error: undefined,
  isLoading: false,
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
