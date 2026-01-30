import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import {
  IAvailableDTO,
  ICustomerLastReservation,
  ICustomerReservation,
  IReservationAll,
  IRoomReservation,
  ITracking,
  IUpcomingAll,
} from '../../interfaces/reservation';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { Pagination } from '../../interfaces/pagination';
import { RESERVATION_FEATURE_KEY, ReservationState } from '../reducers/reservation.reducers';
import { ITreatmentDiscountDTO } from '../../interfaces/treatment';
import { IRoomAll } from '../../interfaces/room';
import { IUserAll } from '../../interfaces/user';
import { IAdditionalAll } from '../../interfaces/additional';
import { IPaymentAll, IPaymentOption } from '../../interfaces/payment';
import { IReview } from '../../interfaces/review';
import { IColorAll } from '../../interfaces/color';

const selectReservationState = createFeatureSelector<ReservationState>(RESERVATION_FEATURE_KEY);

const selectReservationPaginationData = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.page,
);
export const getReservationPaginationPipe = pipe(
  select(selectReservationPaginationData),
  filter((val): val is Pagination<IReservationAll> => val !== undefined),
);

const selectCustomerReservationData = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.customerReservation,
);
export const getCustomerReservationPipe = pipe(
  select(selectCustomerReservationData),
  filter((val): val is ICustomerReservation => val !== undefined),
);

const selectCurrentReservationId = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.currentReservationId,
);
export const getCurrentReservationIdPipe = pipe(
  select(selectCurrentReservationId),
  filter((val): val is string => val !== undefined),
);

const selectMeNavigationParams = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.meReservationParams,
);

export const getMeNavigationParamsPipe = pipe(
  select(selectMeNavigationParams),
  filter((val): val is {
    treatmentId?: string;
    roomId?: string;
    professionalId?: string;
    date?: Date;
    discountId?: string
  } => val !== undefined),
);

const selectNavigationParams = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.reservationParams,
);

export const getNavigationParamsPipe = pipe(
  select(selectNavigationParams),
  filter((val): val is {
    isDashboard: boolean;
    skip: boolean;
    customerId?: string;
    roomId?: string;
    treatmentId?: string;
    groupId?: string;
    professionalId?: string;
    additionalIds?: string[];
    date?: Date;
    discountId?: string;
  } => val !== undefined),
);

const selectAdditionalList = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.additional,
);
export const getAdditionalListPipe = pipe(
  select(selectAdditionalList),
  filter((val): val is IAdditionalAll[] => val !== undefined),
);

const selectTreatmentDiscount = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.treatmentDiscount,
);
export const getTreatmentDiscountPipe = pipe(
  select(selectTreatmentDiscount),
  filter((val): val is ITreatmentDiscountDTO => val !== undefined),
);

const selectRooms = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.rooms,
);
export const getRoomsPipe = pipe(
  select(selectRooms),
  filter((val): val is IRoomAll[] => val !== undefined),
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
  (state: ReservationState) => state?.data,
);
export const getAvailableListPipe = pipe(
  select(selectAvailable),
  filter((val): val is IAvailableDTO[] => val !== undefined),
);

const selectCalendar = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.data,
);
export const getCalendarPipe = pipe(
  select(selectCalendar),
  filter((val): val is IRoomReservation[] => val !== undefined),
);

const selectPaymentOptions = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.paymentOptions,
);
export const getPaymentOptionsPipe = pipe(
  select(selectPaymentOptions),
  filter((val): val is IPaymentOption[] => val !== undefined),
);

const selectPayments = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.payments,
);
export const getPaymentsPipe = pipe(
  select(selectPayments),
  filter((val): val is IPaymentAll[] => val !== undefined),
);

const selectCurrentCompleteReservation = createSelector(
  selectReservationState,
  (state: ReservationState) => state?.currentCompleteReservation,
);
export const getCurrentCompleteReservationPipe = pipe(
  select(selectCurrentCompleteReservation),
  filter((val): val is { reservationId: string; roomId: string; customerId: string; isDashboard: boolean } => val !==
    undefined),
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
  filter((val): val is { step?: number } => val !== undefined),
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
export const getFilteredReservationsPipe = pipe(
  select(selectFilteredReservations),
  filter((val): val is Pagination<IReservationAll> => val !== undefined),
);

const selectCustomers = createSelector(
  selectReservationState,
  (state: ReservationState) => state.customers,
);
export const getCustomersPipe = pipe(
  select(selectCustomers),
  filter((val): val is IUserAll[] => val !== undefined),
);

const selectCustomerInfo = createSelector(
  selectReservationState,
  (state: ReservationState) => state.customer,
);
export const getCustomerInfoPipe = pipe(
  select(selectCustomerInfo),
  filter((val): val is ICustomerLastReservation => val !== undefined),
);

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
