import { createAction, props } from '@ngrx/store';
import { IError } from '../../interfaces/common';
import { IAwsExtract } from '../../interfaces/aws';

enum AwsLambdaActionTypes {
  callAwsLambda = '[Aws] Call lambda',
  awsLambdaSuccess = '[Aws] Success',
  awsLambdaFailure = '[Aws] Failure',
  clean = '[Aws] Clean',
}

export const callAwsLambda = createAction(
  AwsLambdaActionTypes.callAwsLambda,
  props<{ token: string; file: File; userId?: string }>(),
);

export const awsLambdaSuccess = createAction(
  AwsLambdaActionTypes.awsLambdaSuccess,
  props<{ data: IAwsExtract }>(),
);

export const awsLambdaFailure = createAction(
  AwsLambdaActionTypes.awsLambdaFailure,
  props<{ error: IError }>(),
);

export const cleanAws = createAction(AwsLambdaActionTypes.clean);
