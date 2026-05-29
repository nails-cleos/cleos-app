import { createAction, props } from '@ngrx/store';
import { IError, IResponseSuccess, PageRequest } from '../interfaces/common';
import { IColor } from '../interfaces/color';
import { Pagination } from '../interfaces/pagination';

enum ColorActionTypes {
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

export const getColorsPage = createAction(
  ColorActionTypes.getColorsPage,
  props<PageRequest>(),
);

export const colorSuccess = createAction(
  ColorActionTypes.colorSuccess,
  props<{ data: Pagination<IColor> }>(),
);

export const createColor = createAction(
  ColorActionTypes.createColor,
  props<{ color: IColor }>(),
);

export const updateColor = createAction(
  ColorActionTypes.updateColor,
  props<{ id: string, color: IColor }>(),
);

export const colorSaveSuccess = createAction(
  ColorActionTypes.colorSaveSuccess,
  props<IResponseSuccess>(),
);

export const colorFailure = createAction(
  ColorActionTypes.colorFailure,
  props<{ error: IError }>(),
);

export const colorSelected = createAction(
  ColorActionTypes.colorSelected,
  props<{ selected?: IColor }>(),
);

export const getColor = createAction(
  ColorActionTypes.getColor,
  props<{ id: string }>(),
);

export const deleteColor = createAction(
  ColorActionTypes.deleteColor,
  props<{ id: string, name: string }>(),
);

export const cleanColor = createAction(ColorActionTypes.clean);
