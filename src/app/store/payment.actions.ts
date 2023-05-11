import { Action } from '@ngrx/store';

export enum PaymentActionTypes {
  getAll = '[Payment] Get all',
  paymentSuccess = '[Payment] Success',
  paymentSave = '[Payment] Save',
  paymentUpdate = '[Payment] Update',
  paymentSend = '[Payment] Send',
  paymentNotify = '[Payment] Notify',
  paymentRecreate = '[Payment] Recreate',
  paymentSaveSuccess = '[Payment] Save Success',
  paymentNotComplete = '[Payment] Not complete',
  paymentFailure = '[Payment] Failure',
  paymentSelected = '[Payment] Selected',
  paymentByReservation = '[Payment] Find by reservation',
  paymentFind = '[Payment] Find',
  paymentCreate = '[Payment] Create',
  clean = '[Payment] Clean'
}

export class GetAll implements Action {
  readonly type = PaymentActionTypes.getAll;

  constructor(public payload: any) {
  }
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

export class PaymentUpdate implements Action {
  readonly type = PaymentActionTypes.paymentUpdate;

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

export class PaymentFindByReservationId implements Action {
  readonly type = PaymentActionTypes.paymentByReservation;

  constructor(public payload: any) {
  }
}

export class PaymentFind implements Action {
  readonly type = PaymentActionTypes.paymentFind;

  constructor(public payload: any) {
  }
}

export class PaymentCreate implements Action {
  readonly type = PaymentActionTypes.paymentCreate;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = PaymentActionTypes.clean;
}

export type All =
  | GetAll
  | PaymentSave
  | PaymentUpdate
  | PaymentSend
  | PaymentRecreate
  | PaymentNotify
  | PaymentSuccess
  | PaymentSaveSuccess
  | PaymentNotComplete
  | PaymentFailure
  | PaymentFindByReservationId
  | PaymentFind
  | PaymentSelected
  | PaymentCreate
  | Clean;
