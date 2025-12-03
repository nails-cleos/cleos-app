import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IUnavailable, IUnavailableAll } from '../../interfaces/unavailable';
import { IError, ResponseSuccess } from '../../interfaces/common';
import { UNAVAILABLE_FEATURE_KEY, UnavailableState } from '../reducers/unavailable.reducers';
import { Pagination } from '../../interfaces/pagination';
import { IUserAll } from '../../interfaces/user';
import { IRoomAll } from '../../interfaces/room';

const selectUnavailableState = createFeatureSelector<UnavailableState>(UNAVAILABLE_FEATURE_KEY);

const selectUnavailablePaginationData = createSelector(
  selectUnavailableState,
  (state: UnavailableState) => state?.data,
);
export const getUnavailablePaginationPipe = pipe(
  select(selectUnavailablePaginationData),
  filter((val): val is Pagination<IUnavailable> => val !== undefined),
);

const selectCurrentUnavailableId = createSelector(
  selectUnavailableState,
  (state: UnavailableState) => state?.currentUnavailableId,
);
export const getCurrentUnavailableIdPipe = pipe(
  select(selectCurrentUnavailableId),
  filter((val): val is string => val !== undefined),
);

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

const selectUnavailableResponse = createSelector(
  selectUnavailableState,
  (state: UnavailableState) => state?.response,
);
export const getUnavailableResponsePipe = pipe(
  select(selectUnavailableResponse),
  filter((val): val is ResponseSuccess => val !== undefined),
);

const selectUnavailableError = createSelector(
  selectUnavailableState,
  (state: UnavailableState) => state?.error,
);
export const getUnavailableErrorPipe = pipe(
  select(selectUnavailableError),
  filter((val): val is IError => val !== undefined),
);

const selectUnavailableIsLoading = createSelector(
  selectUnavailableState,
  (state: UnavailableState) => state?.isLoading,
);
export const getUnavailableIsLoadingPipe = pipe(
  select(selectUnavailableIsLoading),
  filter((val): val is boolean => val !== undefined),
);
