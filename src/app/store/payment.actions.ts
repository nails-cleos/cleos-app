import { Action } from '@ngrx/store';
import { IError, IResponseSuccess, ResponseSuccess } from '../interfaces/common';
import { IPayment, IPaymentOption, IPaymentRequest, PaymentStatus } from '../interfaces/payment';
import { IReservationPayment } from '../interfaces/reservation';

export enum PaymentActionTypes {
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
  clean = '[Payment] Clean'
}

export class PaymentSuccess implements Action {
  readonly type = PaymentActionTypes.paymentSuccess;

  constructor(public data?: IPaymentOption[]) {
  }
}

export class PaymentNotComplete implements Action {
  readonly type = PaymentActionTypes.paymentNotComplete;

  constructor(public subError: IError[], public response?: IResponseSuccess) {
  }
}

export class PaymentSave implements Action {
  readonly type = PaymentActionTypes.paymentSave;

  constructor(public id: string, public path: 'reservation' | 'transaction', public status: string,
              public paymentStatus: PaymentStatus) {
  }
}

export class AdjustPayments implements Action {
  readonly type = PaymentActionTypes.adjustPayments;

  constructor(public payments: IPaymentRequest[]) {
  }
}

export class UpdatePaymentById implements Action {
  readonly type = PaymentActionTypes.updatePaymentById;

  constructor(public id: string, public payment: IReservationPayment) {
  }
}

export class PaymentSend implements Action {
  readonly type = PaymentActionTypes.paymentSend;

  constructor(public link?: string) {
  }
}

export class Recreate implements Action {
  readonly type = PaymentActionTypes.recreate;

  constructor(public id: string, public paymentType: string) {
  }
}

export class NotifyPayment implements Action {
  readonly type = PaymentActionTypes.notifyPayment;

  constructor(public id: string, public path: 'reservation' | 'transaction', public resourceId: string,
              public preferenceId: string, public paymentType: string) {
  }
}

export class PaymentSaveSuccess extends ResponseSuccess implements Action {
  readonly type = PaymentActionTypes.paymentSaveSuccess;
}

export class PaymentFailure implements Action {
  readonly type = PaymentActionTypes.paymentFailure;

  constructor(public error: IError) {
  }
}

export class PaymentSelected implements Action {
  readonly type = PaymentActionTypes.paymentSelected;

  constructor(public selected?: IPayment | IPayment[], public redirect: boolean = false) {
  }
}

export class GetPaymentByResourceId implements Action {
  readonly type = PaymentActionTypes.getPaymentByResourceId;

  constructor(public id: string, public path: 'reservation' | 'transaction', public redirect: boolean = false) {
  }
}

export class GetPayment implements Action {
  readonly type = PaymentActionTypes.getPayment;

  constructor(public id: string) {
  }
}

export class PaymentOptions implements Action {
  readonly type = PaymentActionTypes.getPaymentOptions;
}

export class CreatePaymentLinkByReservationId implements Action {
  readonly type = PaymentActionTypes.createPaymentLinkByReservationId;

  constructor(public reservationId: string, public payment: IReservationPayment) {
  }
}

export class Clean implements Action {
  readonly type = PaymentActionTypes.clean;
}

export type All =
  | PaymentSave
  | AdjustPayments
  | UpdatePaymentById
  | PaymentSend
  | Recreate
  | NotifyPayment
  | PaymentSuccess
  | PaymentSaveSuccess
  | PaymentNotComplete
  | PaymentFailure
  | GetPaymentByResourceId
  | GetPayment
  | PaymentSelected
  | CreatePaymentLinkByReservationId
  | PaymentOptions
  | Clean;
