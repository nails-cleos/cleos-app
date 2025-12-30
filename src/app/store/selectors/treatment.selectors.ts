import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { ITreatmentAll, ITreatmentGroupAll } from '../../interfaces/treatment';
import { IError, ResponseSuccess } from '../../interfaces/common';
import { TREATMENT_FEATURE_KEY, TreatmentState } from '../reducers/treatment.reducers';
import { Pagination } from '../../interfaces/pagination';
import { IColorAll } from '../../interfaces/color';

const selectTreatmentState = createFeatureSelector<TreatmentState>(TREATMENT_FEATURE_KEY);

const selectTreatmentPaginationData = createSelector(
  selectTreatmentState,
  (state: TreatmentState) => state?.data,
);
export const getTreatmentPaginationPipe = pipe(
  select(selectTreatmentPaginationData),
  filter((val): val is Pagination<ITreatmentGroupAll> => val !== undefined),
);

const selectCurrentTreatmentId = createSelector(
  selectTreatmentState,
  (state: TreatmentState) => state?.currentTreatmentId,
);
export const getCurrentTreatmentIdPipe = pipe(
  select(selectCurrentTreatmentId),
  filter((val): val is string => val !== undefined),
);

const selectTreatmentGroupList = createSelector(
  selectTreatmentState,
  (state: TreatmentState) => state?.data,
);
export const getTreatmentGroupListPipe = pipe(
  select(selectTreatmentGroupList),
  filter((val): val is ITreatmentGroupAll[] => val !== undefined),
);

const selectedTreatment = createSelector(
  selectTreatmentState,
  (state: TreatmentState) => state?.selected,
);
export const getSelectedTreatmentPipe = pipe(
  select(selectedTreatment),
  filter((val): val is ITreatmentGroupAll => val !== undefined),
);

const selectHistories = createSelector(
  selectTreatmentState,
  (state: TreatmentState) => state?.history,
);
export const getHistoriesPipe = pipe(
  select(selectHistories),
  filter((val): val is ITreatmentAll[] => val !== undefined),
);

const selectColors = createSelector(
  selectTreatmentState,
  (state: TreatmentState) => state?.colors,
);
export const getColorsPipe = pipe(
  select(selectColors),
  filter((val): val is IColorAll[] => val !== undefined),
);

const selectSubErrors = createSelector(
  selectTreatmentState,
  (state: TreatmentState) => state?.subErrors,
);
export const getSubErrorsPipe = pipe(
  select(selectSubErrors),
  filter((val): val is IError[] => val !== undefined),
);

export const selectTreatmentResponse = createSelector(
  selectTreatmentState,
  (state: TreatmentState) => state?.response,
);
export const getTreatmentResponsePipe = pipe(
  select(selectTreatmentResponse),
  filter((val): val is ResponseSuccess => val !== undefined),
);

export const selectTreatmentError = createSelector(
  selectTreatmentState,
  (state: TreatmentState) => state?.error,
);

export const selectTreatmentIsLoading = createSelector(
  selectTreatmentState,
  (state: TreatmentState) => state?.isLoading,
);
