import { createReducer, on } from '@ngrx/store';
import {
  clean,
  completeNote,
  createNote,
  deleteNote,
  getAllProfessional,
  getNote,
  noteFailure,
  noteSaveSuccess,
  noteSelected,
  noteSuccess,
  updateNote,
} from '../note.actions';
import { INote } from '../../interfaces/note';
import { IUser } from '../../interfaces/user';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: INote;
  professionals?: IUser[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: INote;
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  professionals: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const noteReducer = createReducer(
  initialState,
  on(getNote, (state) => ({
    ...state,
    data: {} as INote,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllProfessional, (state) => ({
    ...state,
    professionals: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(noteSuccess, (state, { data }) => ({
    ...state,
    professionals: data,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(noteSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(noteSelected, (state, { selected }) => ({
    ...state,
    selected,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(noteFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(updateNote, createNote, deleteNote, completeNote, (state) => ({
    ...state,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(clean, () => initialState),
);
