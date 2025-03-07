import { Action } from '@ngrx/store';

export enum NoteActionTypes {
  getAllProfessional = '[Note] Get all professional',
  noteSuccess = '[Note] Success',
  noteSave = '[Note] Save',
  noteUpdate = '[Note] Update',
  noteSaveSuccess = '[Note] Save Success',
  noteFailure = '[Note] Failure',
  noteSelected = '[Note] Selected',
  noteFind = '[Note] Find',
  noteDelete = '[Note] Delete',
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

export class NoteSave implements Action {
  readonly type = NoteActionTypes.noteSave;

  constructor(public payload: any) {
  }
}

export class NoteUpdate implements Action {
  readonly type = NoteActionTypes.noteUpdate;

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

export class NoteFind implements Action {
  readonly type = NoteActionTypes.noteFind;

  constructor(public payload: any) {
  }
}

export class DeleteNote implements Action {
  readonly type = NoteActionTypes.noteDelete;

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
  | NoteSave
  | NoteUpdate
  | NoteSuccess
  | NoteSaveSuccess
  | NoteFailure
  | NoteFind
  | NoteSelected
  | DeleteNote
  | CompleteNote
  | Clean;
