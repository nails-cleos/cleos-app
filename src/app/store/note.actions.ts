import { Action } from '@ngrx/store';

export enum NoteActionTypes {
  getAllProfessional = '[Note] Get all professional',
  noteSuccess = '[Note] Success',
  createNote = '[Note] Create Note',
  updateNoteById = '[Note] Update note by Id',
  noteSaveSuccess = '[Note] Save Success',
  noteFailure = '[Note] Failure',
  noteSelected = '[Note] Selected',
  findNoteById = '[Note] Find note by Id',
  deleteNoteById = '[Note] Delete note by Id',
  noteComplete = '[Note] Complete',
  clean = '[Note] Clean'
}

export class GetAllProfessional implements Action {
  readonly type = NoteActionTypes.getAllProfessional;
}

export class NoteSuccess implements Action {
  readonly type = NoteActionTypes.noteSuccess;

  constructor(public payload: any) {
  }
}

export class CreateNote implements Action {
  readonly type = NoteActionTypes.createNote;

  constructor(public payload: any) {
  }
}

export class UpdateNoteById implements Action {
  readonly type = NoteActionTypes.updateNoteById;

  constructor(public payload: any) {
  }
}

export class NoteSaveSuccess implements Action {
  readonly type = NoteActionTypes.noteSaveSuccess;

  constructor(public payload: any) {
  }
}

export class NoteFailure implements Action {
  readonly type = NoteActionTypes.noteFailure;

  constructor(public payload: any) {
  }
}

export class NoteSelected implements Action {
  readonly type = NoteActionTypes.noteSelected;

  constructor(public payload: any) {
  }
}

export class FindNoteById implements Action {
  readonly type = NoteActionTypes.findNoteById;

  constructor(public payload: any) {
  }
}

export class DeleteNoteById implements Action {
  readonly type = NoteActionTypes.deleteNoteById;

  constructor(public payload: any) {
  }
}

export class CompleteNote implements Action {
  readonly type = NoteActionTypes.noteComplete;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = NoteActionTypes.clean;
}

export type All =
  | GetAllProfessional
  | CreateNote
  | UpdateNoteById
  | NoteSuccess
  | NoteSaveSuccess
  | NoteFailure
  | FindNoteById
  | NoteSelected
  | DeleteNoteById
  | CompleteNote
  | Clean;
