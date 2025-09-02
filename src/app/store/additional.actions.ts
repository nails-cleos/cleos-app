import { Action } from '@ngrx/store';

export enum AdditionalActionTypes {
  getAdditionalPage = '[Additional] Get additional page',
  getAdditionalList = '[Additional] Get additional list',
  additionalSuccess = '[Additional] Success',
  createAdditional = '[Additional] create additional',
  updateAdditionalById = '[Additional] Update additional by id',
  sortAdditional = '[Additional] Sort additional',
  additionalSaveSuccess = '[Additional] Save Success',
  additionalFailure = '[Additional] Failure',
  additionalSelected = '[Additional] Selected',
  findAdditionalById = '[Additional] Find additional by id',
  deleteAdditionalById = '[Additional] Delete additional by id',
  getAllTreatmentsGroup = '[Additional] Get all treatments group',
  findGroupsSuccess = '[Additional] Find treatment groups success',
  clean = '[Additional] Clean'
}

export class GetAdditionalPage implements Action {
  readonly type = AdditionalActionTypes.getAdditionalPage;

  constructor(public payload: any) {
  }
}

export class GetAdditionalList implements Action {
  readonly type = AdditionalActionTypes.getAdditionalList;
}

export class AdditionalSuccess implements Action {
  readonly type = AdditionalActionTypes.additionalSuccess;

  constructor(public payload: any) {
  }
}

export class CreateAdditional implements Action {
  readonly type = AdditionalActionTypes.createAdditional;

  constructor(public payload: any) {
  }
}

export class UpdateAdditionalById implements Action {
  readonly type = AdditionalActionTypes.updateAdditionalById;

  constructor(public payload: any) {
  }
}

export class SortAdditional implements Action {
  readonly type = AdditionalActionTypes.sortAdditional;

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

export class FindAdditionalById implements Action {
  readonly type = AdditionalActionTypes.findAdditionalById;

  constructor(public payload: any) {
  }
}

export class DeleteAdditionalById implements Action {
  readonly type = AdditionalActionTypes.deleteAdditionalById;

  constructor(public payload: any) {
  }
}

export class GetAllTreatmentsGroup implements Action {
  readonly type = AdditionalActionTypes.getAllTreatmentsGroup;
}

export class FindGroupsSuccess implements Action {
  readonly type = AdditionalActionTypes.findGroupsSuccess;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = AdditionalActionTypes.clean;
}

export type All =
  | GetAdditionalPage
  | GetAdditionalList
  | CreateAdditional
  | UpdateAdditionalById
  | SortAdditional
  | AdditionalSuccess
  | AdditionalSaveSuccess
  | AdditionalFailure
  | FindAdditionalById
  | AdditionalSelected
  | DeleteAdditionalById
  | GetAllTreatmentsGroup
  | FindGroupsSuccess
  | Clean;
