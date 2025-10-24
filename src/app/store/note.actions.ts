import { createAction, props } from '@ngrx/store';
import { IError, ResponseSuccess } from '../interfaces/common';
import { INote } from '../interfaces/note';
import { IUser } from '../interfaces/user';

enum NoteActionTypes {
  getAllProfessional = '[Note] Get all professional',
  noteSuccess = '[Note] Success',
  createNote = '[Note] Create note',
  updateNote = '[Note] Update note by id',
  noteSaveSuccess = '[Note] Save success',
  noteFailure = '[Note] Failure',
  noteSelected = '[Note] Selected',
  getNote = '[Note] Find note by id',
  deleteNote = '[Note] Delete note by id',
  completeNote = '[Note] Complete',
  clean = '[Note] Clean'
}

export const getAllProfessional = createAction(
  NoteActionTypes.getAllProfessional,
);

export const noteSuccess = createAction(
  NoteActionTypes.noteSuccess,
  props<{ data: IUser[] }>(),
);

export const createNote = createAction(
  NoteActionTypes.createNote,
  props<{ note: INote }>(),
);

export const updateNote = createAction(
  NoteActionTypes.updateNote,
  props<{ id: string; note: INote }>(),
);

export const noteSaveSuccess = createAction(
  NoteActionTypes.noteSaveSuccess,
  props<ResponseSuccess>(),
);

export const noteFailure = createAction(
  NoteActionTypes.noteFailure,
  props<{ error: IError }>(),
);

export const noteSelected = createAction(
  NoteActionTypes.noteSelected,
  props<{ selected?: INote }>(),
);

export const getNote = createAction(
  NoteActionTypes.getNote,
  props<{ id: string }>(),
);

export const deleteNote = createAction(
  NoteActionTypes.deleteNote,
  props<{ id: string; description: string }>(),
);

export const completeNote = createAction(
  NoteActionTypes.completeNote,
  props<{ id: string }>(),
);

export const clean = createAction(NoteActionTypes.clean);
