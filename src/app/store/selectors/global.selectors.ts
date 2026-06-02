import { createSelector } from '@ngrx/store';
import { selectRoomError, selectRoomResponse } from './room.selectors';
import { selectTreatmentError, selectTreatmentResponse } from './treatment.selectors';
import { selectDiscountError, selectDiscountResponse } from './discount.selectors';
import { selectUnavailableError, selectUnavailableResponse } from './unavailable.selectors';
import { selectUserError, selectUserResponse } from './user.selectors';
import { selectReservationError, selectReservationResponse } from './reservation.selectors';
import { selectPaymentError, selectPaymentResponse } from './payment.selectors';
import { selectAdditionalError, selectAdditionalResponse } from './additional.selectors';
import { selectOfficeError, selectOfficeResponse } from './office.selectors';
import { selectExpenseError, selectExpenseResponse } from './expense.selectors';
import { selectNoteError, selectNoteResponse } from './note.selectors';
import { selectAccountError, selectAccountResponse } from './account.selectors';
import { selectAuthError, selectAuthResponse } from './auth.selectors';
import { selectInvoiceError, selectInvoiceResponse } from './invoice.selectors';

export const selectGlobalResponse = createSelector(
  selectAccountResponse,
  selectAdditionalResponse,
  selectAuthResponse,

  selectDiscountResponse,
  selectExpenseResponse,

  selectInvoiceResponse,

  selectNoteResponse,

  selectOfficeResponse,
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
  selectAdditionalError,
  selectAuthError,

  selectDiscountError,
  selectExpenseError,

  selectInvoiceError,

  selectNoteError,

  selectOfficeError,
  selectPaymentError,
  selectReservationError,
  selectRoomError,
  selectTreatmentError,
  selectUnavailableError,
  selectUserError,
  (...errors) =>
    errors.find(error => error !== undefined),
);
