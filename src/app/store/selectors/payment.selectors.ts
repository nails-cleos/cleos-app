import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { PAYMENT_FEATURE_KEY, PaymentState } from '../reducers/payment.reducers';
import { IPayment, IPaymentOption } from '../../interfaces/payment';

const selectPaymentState = createFeatureSelector<PaymentState>(PAYMENT_FEATURE_KEY);

const selectResultParams = createSelector(
  selectPaymentState,
  (state: PaymentState) => state?.paymentResultParams,
);
export const getResultParamsPipe = pipe(
  select(selectResultParams),
  filter((val): val is {
    path: 'reservation' | 'transaction';
    id: string;
    status: string;
    paymentId: string;
    preferenceId?: string;
    payerId?: string;
    token?: string;
    reason?: string;
    orderId?: string;
    orderStatusId?: string;
  } => val !== undefined),
);

const selectCurrentPaymentId = createSelector(
  selectPaymentState,
  (state: PaymentState) => state?.currentPaymentId,
);
export const getCurrentPaymentIdPipe = pipe(
  select(selectCurrentPaymentId),
  filter((val): val is string => val !== undefined),
);

const selectCurrentPathId = createSelector(
  selectPaymentState,
  (state: PaymentState) => state?.currentPathId,
);
export const getCurrentPathIdPipe = pipe(
  select(selectCurrentPathId),
  filter((val): val is { path: 'reservation' | 'transaction'; id: string; } => val !== undefined),
);

const selectedPayment = createSelector(
  selectPaymentState,
  (state: PaymentState) => state?.selected,
);
export const getSelectedPaymentPipe = pipe(
  select(selectedPayment),
  filter((val): val is IPayment => val !== undefined),
);

const selectPaymentOptions = createSelector(
  selectPaymentState,
  (state: PaymentState) => state?.data,
);
export const getPaymentOptionsPipe = pipe(
  select(selectPaymentOptions),
  filter((val): val is IPaymentOption[] => val !== undefined),
);

const selectPayments = createSelector(
  selectPaymentState,
  (state: PaymentState) => state?.selected,
);
export const getPaymentsPipe = pipe(
  select(selectPayments),
  filter((val): val is IPayment[] => val !== undefined),
);

const selectSubErrors = createSelector(
  selectPaymentState,
  (state: PaymentState) => state?.subErrors,
);
export const getSubErrorsPipe = pipe(
  select(selectSubErrors),
  filter((val): val is IError[] => val !== undefined),
);

export const selectPaymentResponse = createSelector(
  selectPaymentState,
  (state: PaymentState) => state?.response,
);
export const getPaymentResponsePipe = pipe(
  select(selectPaymentResponse),
  filter((val): val is IResponseSuccess => val !== undefined),
);

export const selectPaymentError = createSelector(
  selectPaymentState,
  (state: PaymentState) => state?.error,
);

export const selectPaymentIsLoading = createSelector(
  selectPaymentState,
  (state: PaymentState) => state?.isLoading,
);
