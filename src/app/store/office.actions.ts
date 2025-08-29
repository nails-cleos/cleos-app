import { Action } from '@ngrx/store';

export enum OfficeActionTypes {
  getOfficesPage = '[Office] Get offices page',
  getAllManager = '[Office] Get all manager',
  officeSuccess = '[Office] Success',
  createOffice = '[Office] Create office',
  updateOfficeById = '[Office] Update office by Id',
  officeSaveSuccess = '[Office] Save Success',
  officeFailure = '[Office] Failure',
  officeSelected = '[Office] Selected',
  findOfficeById = '[Office] Find office by Id',
  deleteOfficeById = '[Office] Delete office by Id',
  clean = '[Office] Clean'
}

export class GetOfficesPage implements Action {
  readonly type = OfficeActionTypes.getOfficesPage;

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

export class CreateOffice implements Action {
  readonly type = OfficeActionTypes.createOffice;

  constructor(public payload: any) {
  }
}

export class UpdateOfficeById implements Action {
  readonly type = OfficeActionTypes.updateOfficeById;

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

export class FindOfficeById implements Action {
  readonly type = OfficeActionTypes.findOfficeById;

  constructor(public payload: any) {
  }
}

export class DeleteOfficeById implements Action {
  readonly type = OfficeActionTypes.deleteOfficeById;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = OfficeActionTypes.clean;
}

export type All =
  | GetOfficesPage
  | GetAllManagers
  | CreateOffice
  | UpdateOfficeById
  | OfficeSuccess
  | OfficeSaveSuccess
  | OfficeFailure
  | FindOfficeById
  | OfficeSelected
  | DeleteOfficeById
  | Clean;
