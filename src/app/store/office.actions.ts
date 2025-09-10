import { Action } from '@ngrx/store';
import { IError, PageRequest, ResponseSuccess } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';
import { IOffice } from '../interfaces/office';
import { IUser } from '../interfaces/user';

export enum OfficeActionTypes {
  getOfficesPage = '[Office] Get offices page',
  getAllManager = '[Office] Get all manager',
  officeSuccess = '[Office] Success',
  managerSuccess = '[Office] Manager Success',
  createOffice = '[Office] Create office',
  updateOffice = '[Office] Update office by Id',
  officeSaveSuccess = '[Office] Save Success',
  officeFailure = '[Office] Failure',
  officeSelected = '[Office] Selected',
  getOffice = '[Office] Find office by Id',
  deleteOffice = '[Office] Delete office by Id',
  clean = '[Office] Clean'
}

export class GetOfficesPage extends PageRequest implements Action {
  readonly type = OfficeActionTypes.getOfficesPage;
}

export class GetAllManagers implements Action {
  readonly type = OfficeActionTypes.getAllManager;
}

export class OfficeSuccess implements Action {
  readonly type = OfficeActionTypes.officeSuccess;

  constructor(public data: Pagination<IOffice>) {
  }
}

export class ManagerSuccess implements Action {
  readonly type = OfficeActionTypes.managerSuccess;

  constructor(public managers: IUser[] ) {
  }
}

export class CreateOffice implements Action {
  readonly type = OfficeActionTypes.createOffice;

  constructor(public office: IOffice) {
  }
}

export class UpdateOffice implements Action {
  readonly type = OfficeActionTypes.updateOffice;

  constructor(public id: string, public office: IOffice) {
  }
}

export class OfficeSaveSuccess extends ResponseSuccess implements Action {
  readonly type = OfficeActionTypes.officeSaveSuccess;
}

export class OfficeFailure implements Action {
  readonly type = OfficeActionTypes.officeFailure;

  constructor(public error: IError) {
  }
}

export class OfficeSelected implements Action {
  readonly type = OfficeActionTypes.officeSelected;

  constructor(public selected?: IOffice) {
  }
}

export class GetOffice implements Action {
  readonly type = OfficeActionTypes.getOffice;

  constructor(public id: string) {
  }
}

export class DeleteOffice implements Action {
  readonly type = OfficeActionTypes.deleteOffice;

  constructor(public id: string, public name: string) {
  }
}

export class Clean implements Action {
  readonly type = OfficeActionTypes.clean;
}

export type All =
  | GetOfficesPage
  | GetAllManagers
  | CreateOffice
  | UpdateOffice
  | OfficeSuccess
  | ManagerSuccess
  | OfficeSaveSuccess
  | OfficeFailure
  | GetOffice
  | OfficeSelected
  | DeleteOffice
  | Clean;
