import { Action } from '@ngrx/store';

export enum ColorActionTypes {
  getAll = '[Color] Get all',
  colorSuccess = '[Color] Success',
  colorSave = '[Color] Save',
  colorUpdate = '[Color] Update',
  colorSaveSuccess = '[Color] Save Success',
  colorFailure = '[Color] Failure',
  colorSelected = '[Color] Selected',
  colorFind = '[Color] Find',
  colorDelete = '[Color] Delete',
  clean = '[Color] Clean'
}

export class GetAll implements Action {
  readonly type = ColorActionTypes.getAll;

  constructor(public payload: any) {
  }
}

export class ColorSuccess implements Action {
  readonly type = ColorActionTypes.colorSuccess;

  constructor(public payload: any) {
  }
}

export class ColorSave implements Action {
  readonly type = ColorActionTypes.colorSave;

  constructor(public payload: any) {
  }
}

export class ColorUpdate implements Action {
  readonly type = ColorActionTypes.colorUpdate;

  constructor(public payload: any) {
  }
}

export class ColorSaveSuccess implements Action {
  readonly type = ColorActionTypes.colorSaveSuccess;

  constructor(public payload: any) {
  }
}

export class ColorFailure implements Action {
  readonly type = ColorActionTypes.colorFailure;

  constructor(public payload: any) {
  }
}

export class ColorSelected implements Action {
  readonly type = ColorActionTypes.colorSelected;

  constructor(public payload: any) {
  }
}

export class ColorFind implements Action {
  readonly type = ColorActionTypes.colorFind;

  constructor(public payload: any) {
  }
}

export class DeleteColor implements Action {
  readonly type = ColorActionTypes.colorDelete;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = ColorActionTypes.clean;
}

export type All =
  | GetAll
  | ColorSave
  | ColorUpdate
  | ColorSuccess
  | ColorSaveSuccess
  | ColorFailure
  | ColorFind
  | ColorSelected
  | DeleteColor
  | Clean;
