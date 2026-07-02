import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import {
  IAvailableDTO,
  ICustomerReservation,
  IReservationAll,
  IRoomReservation,
  ITracking,
  IUpcomingAll,
} from '../../reservation/reservation';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { RESERVATION_FEATURE_KEY, ReservationState } from '../reducers/reservation.reducers';
import { IPaymentAll } from '../../interfaces/payment';
import { IReview } from '../../me/reservation/list/review';
import { IColorAll } from '../../color/color';
import { DetailReservationParams, MeReservationParams, ReservationParams } from '../../util/models/reservation.models';

const selectReservationState = createFeatureSelector<ReservationState>(RESERVATION_FEATURE_KEY);

const selectReservationPaginationData = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.page,
);
export const getReservationPaginationPipe = pipe(select(selectReservationPaginationData));

const selectCustomerReservationData = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.customerReservation,
);
export const getCustomerReservationPipe = pipe(
  select(selectCustomerReservationData),
  filter((val): val is ICustomerReservation => val !== undefined),
);

const selectMeNavigationParams = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.meReservationParams,
);

export const getMeNavigationParamsPipe = pipe(
  select(selectMeNavigationParams),
  filter((val): val is MeReservationParams => val !== undefined),
);

const selectNavigationParams = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.reservationParams,
);

export const getNavigationParamsPipe = pipe(
  select(selectNavigationParams),
  filter((val): val is ReservationParams => val !== undefined),
);

const selectedReservation = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.selected,
);
export const getSelectedReservationPipe = pipe(
  select(selectedReservation),
  filter((val): val is IUpcomingAll => val !== null),
);

const selectAvailable = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.availability,
);
export const getAvailableListPipe = pipe(
  select(selectAvailable),
  filter((val): val is IAvailableDTO[] => val !== undefined),
);

const selectCalendar = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.groupedRooms,
);
export const getCalendarPipe = pipe(
  select(selectCalendar),
  filter((val): val is IRoomReservation[] => val !== undefined),
);

const selectPayments = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.payments,
);
export const getPaymentsPipe = pipe(
  select(selectPayments),
  filter((val): val is IPaymentAll[] => val !== undefined),
);

const selectTracking = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.tracking,
);
export const getTrackingPipe = pipe(
  select(selectTracking),
  filter((val): val is ITracking => val !== undefined),
);

const selectReview = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.review,
);
export const getReviewPipe = pipe(
  select(selectReview),
  filter((val): val is IReview => val !== undefined),
);

const selectColors = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.colors,
);
export const getColorsPipe = pipe(
  select(selectColors),
  filter((val): val is IColorAll[] => val !== undefined),
);

const selectDetailNavigationParams = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.detailReservationParams,
);
export const getDetailNavigationParamsPipe = pipe(
  select(selectDetailNavigationParams),
  filter((val): val is DetailReservationParams => val !== undefined),
);

const selectHistories = createSelector(
  selectReservationState,
  (state: ReservationState) => state.history,
);
export const getHistoriesPipe = pipe(
  select(selectHistories),
  filter((val): val is IReservationAll[] => val !== undefined),
);

const selectFilteredReservations = createSelector(
  selectReservationState,
  (state: ReservationState) => state.filter,
);
export const getFilteredReservationsPipe = pipe(select(selectFilteredReservations));

const selectSubErrors = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.subErrors,
);
export const getSubErrorsPipe = pipe(
  select(selectSubErrors),
  filter((val): val is IError[] => val !== undefined),
);

export const selectReservationResponse = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.response,
);
export const getReservationResponsePipe = pipe(
  select(selectReservationResponse),
  filter((val): val is IResponseSuccess => val !== undefined),
);

export const selectReservationError = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.error,
);
export const getReservationErrorPipe = pipe(
  select(selectReservationError),
  filter((val): val is IError => val !== undefined),
);

export const selectReservationIsLoading = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.isLoading,
);
