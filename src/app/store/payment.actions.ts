import { createAction, props } from '@ngrx/store';
import { IError, IResponseSuccess, ResponseSuccess } from '../interfaces/common';
import { IPayment, IPaymentOption, IPaymentRequest, PaymentStatus } from '../interfaces/payment';
import { IReservationPayment } from '../interfaces/reservation';

enum PaymentActionTypes {
  paymentSuccess = '[Payment] Success',
  paymentSave = '[Payment] Save',
  adjustPayments = '[Payment] Adjust Payments',
  updatePaymentById = '[Payment] Update payment by id',
  paymentSend = '[Payment] Send',
  notifyPayment = '[Payment] Notify',
  recreate = '[Payment] Recreate',
  paymentSaveSuccess = '[Payment] Save Success',
  paymentNotComplete = '[Payment] Not complete',
  paymentFailure = '[Payment] Failure',
  paymentSelected = '[Payment] Selected',
  getPaymentByResourceId = '[Payment] Find by resource',
  getPayment = '[Payment] Find payment by ID',
  getPaymentOptions = '[Payment] Payment options',
  createPaymentLinkByReservationId = '[Payment] Create payment link',
  clean = '[Payment] Clean',
}

export const paymentSuccess = createAction(
  PaymentActionTypes.paymentSuccess,
  props<{ data?: IPaymentOption[] }>(),
);

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

export const updatePaymentById = createAction(
  PaymentActionTypes.updatePaymentById,
  props<{ id: string; payment: IReservationPayment }>(),
);

export const paymentSend = createAction(
  PaymentActionTypes.paymentSend,
  props<{ link?: string }>(),
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
  props<ResponseSuccess>(),
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
  props<{ id: string; path: 'reservation' | 'transaction'; redirect?: boolean }>(),
);

export const getPayment = createAction(
  PaymentActionTypes.getPayment,
  props<{ id: string }>(),
);

export const paymentOptions = createAction(PaymentActionTypes.getPaymentOptions);

export const createPaymentLinkByReservationId = createAction(
  PaymentActionTypes.createPaymentLinkByReservationId,
  props<{ reservationId: string; payment: IReservationPayment }>(),
);

export const clean = createAction(PaymentActionTypes.clean);
