import { createSelector } from '@ngrx/store';
import { selectRoomError, selectRoomResponse } from './room.selectors';
import { selectUserError, selectUserResponse } from './user.selectors';
import { selectReservationError, selectReservationResponse } from './reservation.selectors';
import { selectPaymentError, selectPaymentResponse } from './payment.selectors';
import { selectAuthError, selectAuthResponse } from './auth.selectors';

export const selectGlobalResponse = createSelector(
  selectAuthResponse,
  selectPaymentResponse,
  selectReservationResponse,
  selectRoomResponse,
  selectUserResponse,
  (...responses) =>
    responses.find(response => response !== undefined),
);

export const selectGlobalError = createSelector(
  selectAuthError,
  selectPaymentError,
  selectReservationError,
  selectRoomError,
  selectUserError,
  (...errors) =>
    errors.find(error => error !== undefined),
);
