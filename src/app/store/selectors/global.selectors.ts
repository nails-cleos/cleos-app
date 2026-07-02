import { createSelector } from '@ngrx/store';
import { selectReservationError, selectReservationResponse } from './reservation.selectors';

export const selectGlobalResponse = createSelector(
  selectReservationResponse,
  (...responses) =>
    responses.find(response => response !== undefined),
);

export const selectGlobalError = createSelector(
  selectReservationError,
  (...errors) =>
    errors.find(error => error !== undefined),
);
