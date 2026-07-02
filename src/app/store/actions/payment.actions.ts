import { createAction, props } from '@ngrx/store';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { IPayment, IPaymentRequest, PaymentStatus } from '../../interfaces/payment';
import { IReservationPayment } from '../../reservation/reservation';

enum PaymentActionTypes {
  paymentSave = '[Payment] Save',
  adjustPayments = '[Payment] Adjust Payments',
  notifyPayment = '[Payment] Notify',
  recreate = '[Payment] Recreate',
  paymentSaveSuccess = '[Payment] Save Success',
  paymentNotComplete = '[Payment] Not complete',
  paymentFailure = '[Payment] Failure',
  paymentSelected = '[Payment] Selected',
  getPaymentByResourceId = '[Payment] Find by resource',
  createPaymentLinkByReservationId = '[Payment] Create payment link',
  setPaymentResultParams = '[Payment] Set payment result params',
  clean = '[Payment] Clean',
}

export const paymentNotComplete = createAction(
  PaymentActionTypes.paymentNotComplete,
  props<{ subError: IError[]; response?: IResponseSuccess }>(),
);

export const paymentSave = createAction(
  PaymentActionTypes.paymentSave,
  props<{ id: string; path: 'reservation' | 'transaction'; status: string; paymentStatus: PaymentStatus }>(),
);

export const adjustPayments = createAction(
  PaymentActionTypes.adjustPayments,
  props<{ payments: IPaymentRequest[] }>(),
);

export const recreate = createAction(
  PaymentActionTypes.recreate,
  props<{ id: string; paymentType: string }>(),
);

export const notifyPayment = createAction(
  PaymentActionTypes.notifyPayment,
  props<{
    id: string;
    path: 'reservation' | 'transaction';
    resourceId: string;
    preferenceId: string;
    paymentType: string;
  }>(),
);

export const paymentSaveSuccess = createAction(
  PaymentActionTypes.paymentSaveSuccess,
  props<IResponseSuccess>(),
);

export const paymentFailure = createAction(
  PaymentActionTypes.paymentFailure,
  props<{ error: IError }>(),
);

export const paymentSelected = createAction(
  PaymentActionTypes.paymentSelected,
  props<{ selected?: IPayment | IPayment[]; redirect?: boolean }>(),
);

export const getPaymentByResourceId = createAction(
  PaymentActionTypes.getPaymentByResourceId,
  props<{ id: string; path: 'reservation' | 'transaction' }>(),
);

export const createPaymentLinkByReservationId = createAction(
  PaymentActionTypes.createPaymentLinkByReservationId,
  props<{ reservationId: string; payment: IReservationPayment }>(),
);

export const setPaymentResultParams = createAction(
  PaymentActionTypes.setPaymentResultParams,
  props<{
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
  }>(),
);
