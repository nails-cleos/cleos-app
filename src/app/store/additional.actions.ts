import { Action } from '@ngrx/store';

export enum AdditionalActionTypes {
  getAll = '[Additional] Get all',
  additionalSuccess = '[Additional] Success',
  additionalSave = '[Additional] Save',
  additionalUpdate = '[Additional] Update',
  additionalSaveSuccess = '[Additional] Save Success',
  additionalFailure = '[Additional] Failure',
  additionalSelected = '[Additional] Selected',
  additionalFind = '[Additional] Find',
  additionalDelete = '[Additional] Delete',
  clean = '[Additional] Clean'
}

export class GetAll implements Action {
  readonly type = AdditionalActionTypes.getAll;

  constructor(public payload: any) {
  }
}

export class AdditionalSuccess implements Action {
  readonly type = AdditionalActionTypes.additionalSuccess;

  constructor(public payload: any) {
  }
}

export class AdditionalSave implements Action {
  readonly type = AdditionalActionTypes.additionalSave;

  constructor(public payload: any) {
  }
}

export class AdditionalUpdate implements Action {
  readonly type = AdditionalActionTypes.additionalUpdate;

  constructor(public payload: any) {
  }
}

export class AdditionalSaveSuccess implements Action {
  readonly type = AdditionalActionTypes.additionalSaveSuccess;

  constructor(public payload: any) {
  }
}

export class AdditionalFailure implements Action {
  readonly type = AdditionalActionTypes.additionalFailure;

  constructor(public payload: any) {
  }
}

export class AdditionalSelected implements Action {
  readonly type = AdditionalActionTypes.additionalSelected;

  constructor(public payload: any) {
  }
}

export class AdditionalFind implements Action {
  readonly type = AdditionalActionTypes.additionalFind;

  constructor(public payload: any) {
  }
}

export class DeleteAdditional implements Action {
  readonly type = AdditionalActionTypes.additionalDelete;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = AdditionalActionTypes.clean;
}

export type All =
  | GetAll
  | AdditionalSave
  | AdditionalUpdate
  | AdditionalSuccess
  | AdditionalSaveSuccess
  | AdditionalFailure
  | AdditionalFind
  | AdditionalSelected
  | DeleteAdditional
  | Clean;
