import { Action } from '@ngrx/store';

export enum PaymentActionTypes {
  getAll = '[Payment] Get all',
  paymentSuccess = '[Payment] Success',
  paymentSave = '[Payment] Save',
  paymentUpdate = '[Payment] Update',
  paymentUpdateLink = '[Payment] Update link',
  paymentSend = '[Payment] Send',
  paymentNotify = '[Payment] Notify',
  paymentRecreate = '[Payment] Recreate',
  paymentSaveSuccess = '[Payment] Save Success',
  paymentNotComplete = '[Payment] Not complete',
  paymentFailure = '[Payment] Failure',
  paymentSelected = '[Payment] Selected',
  paymentByResource = '[Payment] Find by resource',
  paymentFind = '[Payment] Find',
  paymentOptions = '[Payment] Options',
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

export class PaymentUpdateLink implements Action {
  readonly type = PaymentActionTypes.paymentUpdateLink;

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

export class PaymentFind implements Action {
  readonly type = PaymentActionTypes.paymentFind;

  constructor(public payload: any) {
  }
}

export class PaymentOptions implements Action {
  readonly type = PaymentActionTypes.paymentOptions;
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
  | PaymentUpdateLink
  | PaymentSend
  | PaymentRecreate
  | PaymentNotify
  | PaymentSuccess
  | PaymentSaveSuccess
  | PaymentNotComplete
  | PaymentFailure
  | PaymentFindByResourceId
  | PaymentFind
  | PaymentSelected
  | PaymentCreate
  | PaymentOptions
  | Clean;
