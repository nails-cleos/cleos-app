import { Action } from '@ngrx/store';
import { IError, PageRequest, ResponseSuccess } from '../interfaces/common';
import { IColor } from '../interfaces/color';
import { Pagination } from '../interfaces/pagination';

export enum ColorActionTypes {
  getColorsPage = '[Color] Get colors page',
  colorSuccess = '[Color] Success',
  createColor = '[Color] Create color',
  updateColor = '[Color] Update color by id',
  colorSaveSuccess = '[Color] Save Success',
  colorFailure = '[Color] Failure',
  colorSelected = '[Color] Selected',
  getColor = '[Color] Find color by id',
  deleteColor = '[Color] Delete color by id',
  clean = '[Color] Clean'
}

export class GetColorsPage extends PageRequest implements Action {
  readonly type = ColorActionTypes.getColorsPage;
}

export class ColorSuccess implements Action {
  readonly type = ColorActionTypes.colorSuccess;

  constructor(public data: Pagination<IColor>) {
  }
}

export class CreateColor implements Action {
  readonly type = ColorActionTypes.createColor;

  constructor(public color: IColor) {
  }
}

export class UpdateColor implements Action {
  readonly type = ColorActionTypes.updateColor;

  constructor(public id: string, public color: IColor) {
  }
}

export class ColorSaveSuccess extends ResponseSuccess implements Action {
  readonly type = ColorActionTypes.colorSaveSuccess;
}

export class ColorFailure implements Action {
  readonly type = ColorActionTypes.colorFailure;

  constructor(public error: IError) {
  }
}

export class ColorSelected implements Action {
  readonly type = ColorActionTypes.colorSelected;

  constructor(public selected?: IColor) {
  }
}

export class GetColor implements Action {
  readonly type = ColorActionTypes.getColor;

  constructor(public id: string) {
  }
}

export class DeleteColor implements Action {
  readonly type = ColorActionTypes.deleteColor;

  constructor(public id: string, public name: string) {
  }
}

export class Clean implements Action {
  readonly type = ColorActionTypes.clean;
}

export type All =
  | GetColorsPage
  | CreateColor
  | UpdateColor
  | ColorSuccess
  | ColorSaveSuccess
  | ColorFailure
  | GetColor
  | ColorSelected
  | DeleteColor
  | Clean;
