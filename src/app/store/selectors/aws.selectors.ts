import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { AWS_FEATURE_KEY, AwsState } from '../reducers/aws.reducers';
import { IAwsExtract } from '../../interfaces/aws';

const selectAwsState = createFeatureSelector<AwsState>(AWS_FEATURE_KEY);

const selectAws = createSelector(
  selectAwsState,
  (state: AwsState) => state?.data,
);
export const getAwsPipe = pipe(
  select(selectAws),
  filter((val): val is IAwsExtract => val !== undefined),
);

export const selectAwsIsLoading = createSelector(
  selectAwsState,
  (state: AwsState) => state?.isLoading,
);
