import { createSelector } from '@ngrx/store';
import { selectReservationError, selectReservationResponse } from './reservation.selectors';
import { selectPaymentError, selectPaymentResponse } from './payment.selectors';

export const selectGlobalResponse = createSelector(
  selectPaymentResponse,
  selectReservationResponse,
  (...responses) =>
    responses.find(response => response !== undefined),
);

export const selectGlobalError = createSelector(
  selectPaymentError,
  selectReservationError,
  (...errors) =>
    errors.find(error => error !== undefined),
);
