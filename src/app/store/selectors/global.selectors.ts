import { createSelector } from '@ngrx/store';
import { selectUserError, selectUserResponse } from './user.selectors';
import { selectReservationError, selectReservationResponse } from './reservation.selectors';
import { selectPaymentError, selectPaymentResponse } from './payment.selectors';
import { selectAuthError, selectAuthResponse } from './auth.selectors';

export const selectGlobalResponse = createSelector(
  selectAuthResponse,
  selectPaymentResponse,
  selectReservationResponse,
  selectUserResponse,
  (...responses) =>
    responses.find(response => response !== undefined),
);

export const selectGlobalError = createSelector(
  selectAuthError,
  selectPaymentError,
  selectReservationError,
  selectUserError,
  (...errors) =>
    errors.find(error => error !== undefined),
);
