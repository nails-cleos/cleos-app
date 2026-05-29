import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IUnavailableAll } from '../../interfaces/unavailable';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { UNAVAILABLE_FEATURE_KEY, UnavailableState } from '../reducers/unavailable.reducers';
import { IUserAll } from '../../interfaces/user';
import { IRoomAll } from '../../interfaces/room';

const selectUnavailableState = createFeatureSelector<UnavailableState>(UNAVAILABLE_FEATURE_KEY);

const selectUnavailablePaginationData = createSelector(
  selectUnavailableState,
  (state: UnavailableState) => state?.data,
);
export const getUnavailablePaginationPipe = pipe(select(selectUnavailablePaginationData));

const selectedUnavailable = createSelector(
  selectUnavailableState,
  (state: UnavailableState) => state?.selected,
);
export const getSelectedUnavailablePipe = pipe(
  select(selectedUnavailable),
  filter((val): val is IUnavailableAll => val !== undefined),
);

const selectProfessionals = createSelector(
  selectUnavailableState,
  (state: UnavailableState) => state?.professionals,
);
export const getProfessionalsPipe = pipe(
  select(selectProfessionals),
  filter((val): val is IUserAll[] => val !== undefined),
);

const selectRooms = createSelector(
  selectUnavailableState,
  (state: UnavailableState) => state?.rooms,
);
export const getRoomsPipe = pipe(
  select(selectRooms),
  filter((val): val is IRoomAll[] => val !== undefined),
);

const selectUnavailableParams = createSelector(
  selectUnavailableState,
  (state: UnavailableState) => state?.unavailableParams,
);
export const getUnavailableParamsPipe = pipe(
  select(selectUnavailableParams),
  filter((val): val is { date?: Date, room?: IRoomAll } => val !== undefined),
);

const selectSubErrors = createSelector(
  selectUnavailableState,
  (state: UnavailableState) => state?.subErrors,
);
export const getSubErrorsPipe = pipe(
  select(selectSubErrors),
  filter((val): val is IError[] => val !== undefined),
);

export const selectUnavailableResponse = createSelector(
  selectUnavailableState,
  (state: UnavailableState) => state?.response,
);
export const getUnavailableResponsePipe = pipe(
  select(selectUnavailableResponse),
  filter((val): val is IResponseSuccess => val !== undefined),
);

export const selectUnavailableError = createSelector(
  selectUnavailableState,
  (state: UnavailableState) => state?.error,
);

export const selectUnavailableIsLoading = createSelector(
  selectUnavailableState,
  (state: UnavailableState) => state?.isLoading,
);
