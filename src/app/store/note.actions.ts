import { Action } from '@ngrx/store';
import { IError, ResponseSuccess } from '../interfaces/common';
import { INote } from '../interfaces/note';
import { IUser } from '../interfaces/user';

export enum NoteActionTypes {
  getAllProfessional = '[Note] Get all professional',
  noteSuccess = '[Note] Success',
  createNote = '[Note] Create Note',
  updateNote = '[Note] Update note by Id',
  noteSaveSuccess = '[Note] Save Success',
  noteFailure = '[Note] Failure',
  noteSelected = '[Note] Selected',
  getNote = '[Note] Find note by Id',
  deleteNote = '[Note] Delete note by Id',
  completeNote = '[Note] Complete',
  clean = '[Note] Clean'
}

export class GetAllProfessional implements Action {
  readonly type = NoteActionTypes.getAllProfessional;
}

export class NoteSuccess implements Action {
  readonly type = NoteActionTypes.noteSuccess;

  constructor(public data: IUser[]) {
  }
}

export class CreateNote implements Action {
  readonly type = NoteActionTypes.createNote;

  constructor(public note: INote) {
  }
}

export class UpdateNote implements Action {
  readonly type = NoteActionTypes.updateNote;

  constructor(public id: string, public note: INote) {
  }
}

export class NoteSaveSuccess extends ResponseSuccess implements Action {
  readonly type = NoteActionTypes.noteSaveSuccess;
}

export class NoteFailure implements Action {
  readonly type = NoteActionTypes.noteFailure;

  constructor(public error: IError) {
  }
}

export class NoteSelected implements Action {
  readonly type = NoteActionTypes.noteSelected;

  constructor(public selected?: INote) {
  }
}

export class GetNote implements Action {
  readonly type = NoteActionTypes.getNote;

  constructor(public id: string) {
  }
}

export class DeleteNote implements Action {
  readonly type = NoteActionTypes.deleteNote;

  constructor(public id: string, public description: string) {
  }
}

export class CompleteNote implements Action {
  readonly type = NoteActionTypes.completeNote;

  constructor(public id: string) {
  }
}

export class Clean implements Action {
  readonly type = NoteActionTypes.clean;
}

export type All =
  | GetAllProfessional
  | CreateNote
  | UpdateNote
  | NoteSuccess
  | NoteSaveSuccess
  | NoteFailure
  | GetNote
  | NoteSelected
  | DeleteNote
  | CompleteNote
  | Clean;
