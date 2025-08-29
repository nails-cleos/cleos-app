import { Action } from '@ngrx/store';

export enum ColorActionTypes {
  getColorsPage = '[Color] Get colors page',
  colorSuccess = '[Color] Success',
  createColor = '[Color] Create color',
  updateColorById = '[Color] Update color by id',
  colorSaveSuccess = '[Color] Save Success',
  colorFailure = '[Color] Failure',
  colorSelected = '[Color] Selected',
  findColorById = '[Color] Find color by id',
  deleteColorById = '[Color] Delete color by id',
  clean = '[Color] Clean'
}

export class GetColorsPage implements Action {
  readonly type = ColorActionTypes.getColorsPage;

  constructor(public payload: any) {
  }
}

export class ColorSuccess implements Action {
  readonly type = ColorActionTypes.colorSuccess;

  constructor(public payload: any) {
  }
}

export class CreateColor implements Action {
  readonly type = ColorActionTypes.createColor;

  constructor(public payload: any) {
  }
}

export class UpdateColorById implements Action {
  readonly type = ColorActionTypes.updateColorById;

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

export class FindColorById implements Action {
  readonly type = ColorActionTypes.findColorById;

  constructor(public payload: any) {
  }
}

export class DeleteColorById implements Action {
  readonly type = ColorActionTypes.deleteColorById;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = ColorActionTypes.clean;
}

export type All =
  | GetColorsPage
  | CreateColor
  | UpdateColorById
  | ColorSuccess
  | ColorSaveSuccess
  | ColorFailure
  | FindColorById
  | ColorSelected
  | DeleteColorById
  | Clean;
