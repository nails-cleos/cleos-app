import { createSelector } from '@ngrx/store';
import { selectRoomError, selectRoomResponse } from './room.selectors';
import { selectTreatmentError, selectTreatmentResponse } from './treatment.selectors';
import { selectCatalogueError, selectCatalogueResponse } from './catalogue.selectors';
import { selectDiscountError, selectDiscountResponse } from './discount.selectors';
import { selectUnavailableError, selectUnavailableResponse } from './unavailable.selectors';
import { selectUserError, selectUserResponse } from './user.selectors';
import { selectReservationError, selectReservationResponse } from './reservation.selectors';
import { selectPaymentError, selectPaymentResponse } from './payment.selectors';
import { selectAdditionalError, selectAdditionalResponse } from './additional.selectors';
import { selectCurrencyError, selectCurrencyResponse } from './currency.selectors';
import { selectOfficeError, selectOfficeResponse } from './office.selectors';
import { selectColorError, selectColorResponse } from './color.selectors';
import { selectExpenseError, selectExpenseResponse } from './expense.selectors';
import { selectNoteError, selectNoteResponse } from './note.selectors';
import { selectAccountError, selectAccountResponse } from './account.selectors';
import { selectAuthError, selectAuthResponse } from './auth.selectors';
import { selectInvoiceError, selectInvoiceResponse } from './invoice.selectors';
import { selectStatementError, selectStatementResponse } from './statement.selectors';
import { selectDocumentError, selectDocumentResponse } from './document.selectors';

export const selectGlobalResponse = createSelector(
  selectAccountResponse,
  selectAdditionalResponse,
  selectAuthResponse,

  selectCatalogueResponse,
  selectColorResponse,
  selectCurrencyResponse,

  selectDiscountResponse,
  selectDocumentResponse,
  selectExpenseResponse,

  selectInvoiceResponse,

  selectNoteResponse,

  selectOfficeResponse,
  selectPaymentResponse,
  selectReservationResponse,
  selectRoomResponse,
  selectStatementResponse,
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

  selectCatalogueError,
  selectColorError,
  selectCurrencyError,

  selectDiscountError,
  selectDocumentError,
  selectExpenseError,

  selectInvoiceError,

  selectNoteError,

  selectOfficeError,
  selectPaymentError,
  selectReservationError,
  selectRoomError,
  selectStatementError,
  selectTreatmentError,
  selectUnavailableError,
  selectUserError,
  (...errors) =>
    errors.find(error => error !== undefined),
);
