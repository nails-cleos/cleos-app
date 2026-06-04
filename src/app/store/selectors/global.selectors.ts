import { createSelector } from '@ngrx/store';
import { selectRoomError, selectRoomResponse } from './room.selectors';
import { selectTreatmentError, selectTreatmentResponse } from './treatment.selectors';
import { selectUnavailableError, selectUnavailableResponse } from './unavailable.selectors';
import { selectUserError, selectUserResponse } from './user.selectors';
import { selectReservationError, selectReservationResponse } from './reservation.selectors';
import { selectPaymentError, selectPaymentResponse } from './payment.selectors';
import { selectAuthError, selectAuthResponse } from './auth.selectors';

export const selectGlobalResponse = createSelector(
  selectAuthResponse,
  selectPaymentResponse,
  selectReservationResponse,
  selectRoomResponse,
  selectTreatmentResponse,
  selectUnavailableResponse,
  selectUserResponse,
  (...responses) =>
    responses.find(response => response !== undefined),
);

export const selectGlobalError = createSelector(
  selectAuthError,
  selectPaymentError,
  selectReservationError,
  selectRoomError,
  selectTreatmentError,
  selectUnavailableError,
  selectUserError,
  (...errors) =>
    errors.find(error => error !== undefined),
);
