import { Action } from '@ngrx/store';

export enum AdditionalActionTypes {
  getAll = '[Additional] Get all',
  getAdditionalList = '[Additional] Get additional List',
  additionalSuccess = '[Additional] Success',
  additionalSave = '[Additional] Save',
  additionalUpdate = '[Additional] Update',
  additionalUpdateSort = '[Additional] Update sort',
  additionalSaveSuccess = '[Additional] Save Success',
  additionalFailure = '[Additional] Failure',
  additionalSelected = '[Additional] Selected',
  additionalFind = '[Additional] Find',
  additionalDelete = '[Additional] Delete',
  findGroups = '[Additional] Find treatment groups',
  findGroupsSuccess = '[Additional] Find treatment groups success',
  clean = '[Additional] Clean'
}

export class GetAll implements Action {
  readonly type = AdditionalActionTypes.getAll;

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

export class AdditionalUpdateSort implements Action {
  readonly type = AdditionalActionTypes.additionalUpdateSort;

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

export class FindGroups implements Action {
  readonly type = AdditionalActionTypes.findGroups;
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
  | GetAll
  | GetAdditionalList
  | AdditionalSave
  | AdditionalUpdate
  | AdditionalUpdateSort
  | AdditionalSuccess
  | AdditionalSaveSuccess
  | AdditionalFailure
  | AdditionalFind
  | AdditionalSelected
  | DeleteAdditional
  | FindGroups
  | FindGroupsSuccess
  | Clean;
