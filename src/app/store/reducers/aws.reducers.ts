import { createReducer, on } from '@ngrx/store';
import { awsLambdaFailure, awsLambdaSuccess, callAwsLambda, cleanAws } from '../aws.actions';
import { IError } from '../../interfaces/common';
import { IAwsExtract } from '../../interfaces/aws';

export const AWS_FEATURE_KEY = 'aws';

export interface AwsState {
  data?: IAwsExtract;
  error?: IError;
  isLoading: boolean;
}

export const initialState: AwsState = {
  data: undefined,
  error: undefined,
  isLoading: false,
};

export const awsReducer = createReducer(
  initialState,
  on(callAwsLambda, (state): AwsState => ({
    ...state,
    data: {} as IAwsExtract,
    isLoading: true,
  })),
  on(awsLambdaSuccess, (state, { data }): AwsState => ({
    ...state,
    data,
    error: undefined,
    isLoading: false,
  })),
  on(awsLambdaFailure, (state, { error }): AwsState => ({
    ...state,
    error,
    isLoading: false,
  })),
  on(cleanAws, (): AwsState => initialState),
);
