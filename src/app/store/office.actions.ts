import { Action } from '@ngrx/store';

export enum OfficeActionTypes {
  getAll = '[Office] Get all',
  getAllManager = '[Office] Get all manager',
  officeSuccess = '[Office] Success',
  officeSave = '[Office] Save',
  officeUpdate = '[Office] Update',
  officeSaveSuccess = '[Office] Save Success',
  officeFailure = '[Office] Failure',
  officeSelected = '[Office] Selected',
  officeFind = '[Office] Find',
  officeDelete = '[Office] Delete',
  clean = '[Office] Clean'
}

export class GetAll implements Action {
  readonly type = OfficeActionTypes.getAll;

  constructor(public payload: any) {
  }
}

export class GetAllManagers implements Action {
  readonly type = OfficeActionTypes.getAllManager;
}

export class OfficeSuccess implements Action {
  readonly type = OfficeActionTypes.officeSuccess;

  constructor(public payload: any) {
  }
}

export class OfficeSave implements Action {
  readonly type = OfficeActionTypes.officeSave;

  constructor(public payload: any) {
  }
}

export class OfficeUpdate implements Action {
  readonly type = OfficeActionTypes.officeUpdate;

  constructor(public payload: any) {
  }
}

export class OfficeSaveSuccess implements Action {
  readonly type = OfficeActionTypes.officeSaveSuccess;

  constructor(public payload: any) {
  }
}

export class OfficeFailure implements Action {
  readonly type = OfficeActionTypes.officeFailure;

  constructor(public payload: any) {
  }
}

export class OfficeSelected implements Action {
  readonly type = OfficeActionTypes.officeSelected;

  constructor(public payload: any) {
  }
}

export class OfficeFind implements Action {
  readonly type = OfficeActionTypes.officeFind;

  constructor(public payload: any) {
  }
}

export class DeleteOffice implements Action {
  readonly type = OfficeActionTypes.officeDelete;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = OfficeActionTypes.clean;
}

export type All =
  | GetAll
  | GetAllManagers
  | OfficeSave
  | OfficeUpdate
  | OfficeSuccess
  | OfficeSaveSuccess
  | OfficeFailure
  | OfficeFind
  | OfficeSelected
  | DeleteOffice
  | Clean;
