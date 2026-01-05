import { Pagination } from '../../interfaces/pagination';
import {
  cleanColor,
  colorFailure,
  colorSaveSuccess,
  colorSelected,
  colorSuccess,
  createColor,
  deleteColor,
  getColor,
  getColorsPage,
  setCurrentColorId,
  updateColor,
} from '../color.actions';
import { IColor } from '../../interfaces/color';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';

export const COLOR_FEATURE_KEY = 'color';

export interface ColorState {
  response?: IResponseSuccess;
  data?: Pagination<IColor>;
  error?: IError;
  subErrors?: IError[];
  selected?: IColor;
  currentColorId?: string;
  isLoading: boolean;
}

export const initialState: ColorState = {
  response: undefined,
  data: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  currentColorId: undefined,
  isLoading: false,
};

export const colorReducer = createReducer(
  initialState,
  on(getColorsPage, (state) => ({
    ...state,
    data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IColor>,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getColor, (state) => ({
    ...state,
    subErrors: undefined,
    selected: {} as IColor,
    response: undefined,
  })),
  on(colorSuccess, (state, { data }) => ({
    ...state,
    data: data,
    subErrors: undefined,
    response: undefined,
  })),
  on(colorSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(colorSelected, (state, { selected }) => ({
    ...state,
    selected: selected,
    subErrors: undefined,
    response: undefined,
  })),
  on(colorFailure, (state, { error }) => ({
    ...state,
    error: error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(updateColor, createColor, deleteColor, (state) => ({
    ...state,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
    selected: undefined,
  })),
  on(setCurrentColorId, (state, { colorId }) => ({
    ...state,
    currentColorId: colorId,
  })),
  on(cleanColor, () => initialState),
);
