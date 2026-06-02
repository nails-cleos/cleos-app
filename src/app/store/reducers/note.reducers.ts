import { createReducer, on } from '@ngrx/store';
import {
  cleanNote,
  completeNote,
  createNote,
  deleteNote,
  getAllProfessional,
  getNote,
  noteFailure,
  noteSaveSuccess,
  noteSelected,
  noteSuccess,
  setNoteNavigationParams,
  updateNote,
} from '../actions/note.actions';
import { INote } from '../../interfaces/note';
import { IUserAll } from '../../interfaces/user';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { clearGlobalError, clearGlobalResponse } from '../actions/global.actions';

export const NOTE_FEATURE_KEY = 'note';

export interface NoteState {
  response?: IResponseSuccess;
  data?: INote;
  professionals?: IUserAll[];
  error?: IError;
  subErrors?: IError[];
  selected?: INote;
  noteNavigationParams?: { professional?: IUserAll, date?: Date };
  isLoading: boolean;
}

export const initialState: NoteState = {
  response: undefined,
  data: undefined,
  professionals: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  noteNavigationParams: undefined,
  isLoading: false,
};

export const noteReducer = createReducer(
  initialState,
  on(getNote, (state) => ({
    ...state,
    data: {} as INote,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllProfessional, (state) => ({
    ...state,
    professionals: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(noteSuccess, (state, { data }) => ({
    ...state,
    professionals: data,
    subErrors: undefined,
    response: undefined,
  })),
  on(noteSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(noteSelected, (state, { selected }) => ({
    ...state,
    selected,
    subErrors: undefined,
    response: undefined,
  })),
  on(noteFailure, (state, { error }) => ({
    ...state,
    error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(updateNote, createNote, deleteNote, completeNote, (state) => ({
    ...state,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(setNoteNavigationParams, (state, { date, professional }) => ({
    ...state,
    noteNavigationParams: {
      date,
      professional ,
    },
  })),
  on(cleanNote, () => initialState),

  on(clearGlobalResponse, (state) => ({
    ...state,
    response: undefined,
  })),

  on(clearGlobalError, (state) => ({
    ...state,
    error: undefined,
    subErrors: undefined,
  })),
);
