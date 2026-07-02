import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { PAYMENT_FEATURE_KEY, PaymentState } from '../reducers/payment.reducers';

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
    paymentType?: string;
    accountId?: string;
  } => val !== undefined),
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
