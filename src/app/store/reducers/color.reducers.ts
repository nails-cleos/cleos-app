import { Pagination } from '../../interfaces/pagination';
import {
  clean,
  colorFailure,
  colorSaveSuccess,
  colorSelected,
  colorSuccess,
  createColor,
  deleteColor,
  getColor,
  getColorsPage,
  updateColor,
} from '../color.actions';
import { IColor } from '../../interfaces/color';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';

export interface State {
  response?: IResponseSuccess;
  data?: Pagination<IColor>;
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IColor;
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const colorReducer = createReducer(
  initialState,
  on(getColorsPage, (state) => ({
    ...state,
    data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IColor>,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getColor, (state) => ({
    ...state,
    errorMessage: undefined,
    subErrors: undefined,
    selected: {} as IColor,
    response: undefined,
  })),
  on(colorSuccess, (state, { data }) => ({
    ...state,
    data: data,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(colorSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(colorSelected, (state, { selected }) => ({
    ...state,
    selected: selected,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(colorFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    error: error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(updateColor, createColor, deleteColor, (state) => ({
    ...state,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(clean, () => initialState),
);
