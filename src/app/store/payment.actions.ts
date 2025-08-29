import { Action } from '@ngrx/store';

export enum PaymentActionTypes {
  paymentSuccess = '[Payment] Success',
  paymentSave = '[Payment] Save',
  adjustPayments = '[Payment] Adjust Payments',
  updatePaymentById = '[Payment] Update payment by id',
  paymentSend = '[Payment] Send',
  paymentNotify = '[Payment] Notify',
  paymentRecreate = '[Payment] Recreate',
  paymentSaveSuccess = '[Payment] Save Success',
  paymentNotComplete = '[Payment] Not complete',
  paymentFailure = '[Payment] Failure',
  paymentSelected = '[Payment] Selected',
  paymentByResource = '[Payment] Find by resource',
  findPaymentById = '[Payment] Find payment by ID',
  paymentOptions = '[Payment] Payment options',
  createPaymentLink = '[Payment] Create payment link',
  clean = '[Payment] Clean'
}

export class PaymentSuccess implements Action {
  readonly type = PaymentActionTypes.paymentSuccess;

  constructor(public payload: any) {
  }
}

export class PaymentNotComplete implements Action {
  readonly type = PaymentActionTypes.paymentNotComplete;

  constructor(public payload: any) {
  }
}

export class PaymentSave implements Action {
  readonly type = PaymentActionTypes.paymentSave;

  constructor(public payload: any) {
  }
}

export class AdjustPayments implements Action {
  readonly type = PaymentActionTypes.adjustPayments;

  constructor(public payload: any) {
  }
}

export class UpdatePaymentById implements Action {
  readonly type = PaymentActionTypes.updatePaymentById;

  constructor(public payload: any) {
  }
}

export class PaymentSend implements Action {
  readonly type = PaymentActionTypes.paymentSend;

  constructor(public payload: any) {
  }
}

export class PaymentRecreate implements Action {
  readonly type = PaymentActionTypes.paymentRecreate;

  constructor(public payload: any) {
  }
}

export class PaymentNotify implements Action {
  readonly type = PaymentActionTypes.paymentNotify;

  constructor(public payload: any) {
  }
}

export class PaymentSaveSuccess implements Action {
  readonly type = PaymentActionTypes.paymentSaveSuccess;

  constructor(public payload: any) {
  }
}

export class PaymentFailure implements Action {
  readonly type = PaymentActionTypes.paymentFailure;

  constructor(public payload: any) {
  }
}

export class PaymentSelected implements Action {
  readonly type = PaymentActionTypes.paymentSelected;

  constructor(public payload: any) {
  }
}

export class PaymentFindByResourceId implements Action {
  readonly type = PaymentActionTypes.paymentByResource;

  constructor(public payload: any) {
  }
}

export class FindPaymentById implements Action {
  readonly type = PaymentActionTypes.findPaymentById;

  constructor(public payload: any) {
  }
}

export class PaymentOptions implements Action {
  readonly type = PaymentActionTypes.paymentOptions;
}

export class CreatePaymentLink implements Action {
  readonly type = PaymentActionTypes.createPaymentLink;

  constructor(public payload: any) {
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
  | PaymentRecreate
  | PaymentNotify
  | PaymentSuccess
  | PaymentSaveSuccess
  | PaymentNotComplete
  | PaymentFailure
  | PaymentFindByResourceId
  | FindPaymentById
  | PaymentSelected
  | CreatePaymentLink
  | PaymentOptions
  | Clean;
