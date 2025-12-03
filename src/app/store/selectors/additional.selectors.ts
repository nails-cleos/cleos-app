import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IAdditional, IAdditionalAll } from '../../interfaces/additional';
import { IError, ResponseSuccess } from '../../interfaces/common';
import { ADDITIONAL_FEATURE_KEY, AdditionalState } from '../reducers/additional.reducers';
import { Pagination } from '../../interfaces/pagination';
import { ITreatmentGroupAll } from '../../interfaces/treatment';

const selectAdditionalState = createFeatureSelector<AdditionalState>(ADDITIONAL_FEATURE_KEY);

const selectAdditionalData = createSelector(
  selectAdditionalState,
  (state: AdditionalState) => state?.data,
);
export const getAdditionalListPipe = pipe(
  select(selectAdditionalData),
  filter((val): val is IAdditionalAll[] => val !== undefined),
);

const selectAdditionalPaginationData = createSelector(
  selectAdditionalState,
  (state: AdditionalState) => state?.data,
);
export const getAdditionalPaginationPipe = pipe(
  select(selectAdditionalPaginationData),
  filter((val): val is Pagination<IAdditional> => val !== undefined),
);

const selectCurrentAdditionalId = createSelector(
  selectAdditionalState,
  (state: AdditionalState) => state?.currentAdditionalId,
);
export const getCurrentAdditionalIdPipe = pipe(
  select(selectCurrentAdditionalId),
  filter((val): val is string => val !== undefined),
);

const selectedAdditional = createSelector(
  selectAdditionalState,
  (state: AdditionalState) => state?.selected,
);
export const getSelectedAdditionalPipe = pipe(
  select(selectedAdditional),
  filter((val): val is IAdditionalAll => val !== undefined),
);

const selectSubErrors = createSelector(
  selectAdditionalState,
  (state: AdditionalState) => state?.subErrors,
);
export const getSubErrorsPipe = pipe(
  select(selectSubErrors),
  filter((val): val is IError[] => val !== undefined),
);

const selectGroups = createSelector(
  selectAdditionalState,
  (state: AdditionalState) => state?.groups,
);
export const getGroupPipe = pipe(
  select(selectGroups),
  filter((val): val is ITreatmentGroupAll[] => val !== undefined),
);

const selectAdditionalResponse = createSelector(
  selectAdditionalState,
  (state: AdditionalState) => state?.response,
);
export const getAdditionalResponsePipe = pipe(
  select(selectAdditionalResponse),
  filter((val): val is ResponseSuccess => val !== undefined),
);

const selectAdditionalError = createSelector(
  selectAdditionalState,
  (state: AdditionalState) => state?.error,
);
export const getAdditionalErrorPipe = pipe(
  select(selectAdditionalError),
  filter((val): val is IError => val !== undefined),
);

const selectAdditionalIsLoading = createSelector(
  selectAdditionalState,
  (state: AdditionalState) => state?.isLoading,
);
export const getAdditionalIsLoadingPipe = pipe(
  select(selectAdditionalIsLoading),
  filter((val): val is boolean => val !== undefined),
);
