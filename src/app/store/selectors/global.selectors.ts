import { createSelector } from '@ngrx/store';
import { selectReservationError, selectReservationResponse } from './reservation.selectors';
import { selectPaymentError, selectPaymentResponse } from './payment.selectors';
import { selectAuthError, selectAuthResponse } from './auth.selectors';

export const selectGlobalResponse = createSelector(
  selectAuthResponse,
  selectPaymentResponse,
  selectReservationResponse,
  (...responses) =>
    responses.find(response => response !== undefined),
);

export const selectGlobalError = createSelector(
  selectAuthError,
  selectPaymentError,
  selectReservationError,
  (...errors) =>
    errors.find(error => error !== undefined),
);
