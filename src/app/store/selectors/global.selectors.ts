import { createSelector } from '@ngrx/store';
import { selectRoomError, selectRoomResponse } from './room.selectors';
import { selectTreatmentError, selectTreatmentResponse } from './treatment.selectors';
import { selectUnavailableError, selectUnavailableResponse } from './unavailable.selectors';
import { selectUserError, selectUserResponse } from './user.selectors';
import { selectReservationError, selectReservationResponse } from './reservation.selectors';
import { selectPaymentError, selectPaymentResponse } from './payment.selectors';
import { selectExpenseError, selectExpenseResponse } from './expense.selectors';
import { selectNoteError, selectNoteResponse } from './note.selectors';
import { selectAccountError, selectAccountResponse } from './account.selectors';
import { selectAuthError, selectAuthResponse } from './auth.selectors';
import { selectInvoiceError, selectInvoiceResponse } from './invoice.selectors';

export const selectGlobalResponse = createSelector(
  selectAccountResponse,
  selectAuthResponse,

  selectExpenseResponse,

  selectInvoiceResponse,

  selectNoteResponse,
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
  selectAccountError,
  selectAuthError,

  selectExpenseError,

  selectInvoiceError,

  selectNoteError,
  selectPaymentError,
  selectReservationError,
  selectRoomError,
  selectTreatmentError,
  selectUnavailableError,
  selectUserError,
  (...errors) =>
    errors.find(error => error !== undefined),
);
