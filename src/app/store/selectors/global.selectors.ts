import { createSelector } from '@ngrx/store';
import { selectRoomError, selectRoomIsLoading, selectRoomResponse } from './room.selectors';
import { selectTreatmentError, selectTreatmentIsLoading, selectTreatmentResponse } from './treatment.selectors';
import { selectCatalogueError, selectCatalogueIsLoading, selectCatalogueResponse } from './catalogue.selectors';
import { selectDiscountError, selectDiscountIsLoading, selectDiscountResponse } from './discount.selectors';
import { selectUnavailableError, selectUnavailableIsLoading, selectUnavailableResponse } from './unavailable.selectors';
import { selectUserError, selectUserIsLoading, selectUserResponse } from './user.selectors';
import { selectReservationError, selectReservationIsLoading, selectReservationResponse } from './reservation.selectors';
import { selectPaymentError, selectPaymentIsLoading, selectPaymentResponse } from './payment.selectors';
import { selectAdditionalError, selectAdditionalIsLoading, selectAdditionalResponse } from './additional.selectors';
import { selectCurrencyError, selectCurrencyIsLoading, selectCurrencyResponse } from './currency.selectors';
import { selectOfficeError, selectOfficeIsLoading, selectOfficeResponse } from './office.selectors';
import { selectColorError, selectColorIsLoading, selectColorResponse } from './color.selectors';
import { selectExpenseError, selectExpenseIsLoading, selectExpenseResponse } from './expense.selectors';
import { selectNoteError, selectNoteIsLoading, selectNoteResponse } from './note.selectors';
import { selectAccountError, selectAccountIsLoading, selectAccountResponse } from './account.selectors';
import { selectAuthError, selectAuthIsLoading, selectAuthResponse } from './auth.selectors';
import { selectNotificationIsLoading } from './notification.selectors';

export const selectGlobalIsLoading = createSelector(
  selectAccountIsLoading,
  selectAdditionalIsLoading,
  selectAuthIsLoading,
  selectCatalogueIsLoading,
  selectColorIsLoading,
  selectCurrencyIsLoading,
  selectDiscountIsLoading,
  selectExpenseIsLoading,
  selectNoteIsLoading,
  selectNotificationIsLoading,
  selectOfficeIsLoading,
  selectPaymentIsLoading,
  selectReservationIsLoading,
  selectRoomIsLoading,
  selectTreatmentIsLoading,
  selectUnavailableIsLoading,
  selectUserIsLoading,
  (...loadings) => loadings.some(Boolean),
);

export const selectGlobalResponse = createSelector(
  selectAccountResponse,
  selectAdditionalResponse,
  selectAuthResponse,
  selectCatalogueResponse,
  selectColorResponse,
  selectCurrencyResponse,
  selectDiscountResponse,
  selectExpenseResponse,
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
  selectCatalogueError,
  selectColorError,
  selectCurrencyError,
  selectDiscountError,
  selectExpenseError,
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
