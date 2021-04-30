import { Action } from '@ngrx/store';

export enum UnavailableActionTypes {
  getAll = '[Unavailable] Get all',
  unavailableSuccess = '[Unavailable] Success',
  getAllProfessional = '[Unavailable] Get all professional',
  getRoom = '[Unavailable] Get room',
  roomSuccess = '[Unavailable] Get room success',
  unavailableSave = '[Unavailable] Save',
  unavailableUpdate = '[Unavailable] Update',
  unavailableSaveSuccess = '[Unavailable] Save Success',
  unavailableFailure = '[Unavailable] Failure',
  unavailableSelected = '[Unavailable] Selected',
  unavailableFind = '[Unavailable] Find',
  unavailableDelete = '[Unavailable] Delete',
  clean = '[Unavailable] Clean'
}

export class GetAll implements Action {
  readonly type = UnavailableActionTypes.getAll;

  constructor(public payload: any) {
  }
}

export class GetAllProfessional implements Action {
  readonly type = UnavailableActionTypes.getAllProfessional;
}

export class GetRoom implements Action {
  readonly type = UnavailableActionTypes.getRoom;

  constructor(public payload: any) {
  }
}

export class UnavailableSuccess implements Action {
  readonly type = UnavailableActionTypes.unavailableSuccess;

  constructor(public payload: any) {
  }
}

export class RoomSuccess implements Action {
  readonly type = UnavailableActionTypes.roomSuccess;

  constructor(public payload: any) {
  }
}

export class UnavailableSave implements Action {
  readonly type = UnavailableActionTypes.unavailableSave;

  constructor(public payload: any) {
  }
}

export class UnavailableUpdate implements Action {
  readonly type = UnavailableActionTypes.unavailableUpdate;

  constructor(public payload: any) {
  }
}

export class UnavailableSaveSuccess implements Action {
  readonly type = UnavailableActionTypes.unavailableSaveSuccess;

  constructor(public payload: any) {
  }
}

export class UnavailableFailure implements Action {
  readonly type = UnavailableActionTypes.unavailableFailure;

  constructor(public payload: any) {
  }
}

export class UnavailableSelected implements Action {
  readonly type = UnavailableActionTypes.unavailableSelected;

  constructor(public payload: any) {
  }
}

export class UnavailableFind implements Action {
  readonly type = UnavailableActionTypes.unavailableFind;

  constructor(public payload: any) {
  }
}

export class DeleteUnavailable implements Action {
  readonly type = UnavailableActionTypes.unavailableDelete;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = UnavailableActionTypes.clean;
}

export type All =
  | GetAll
  | GetAllProfessional
  | GetRoom
  | UnavailableSave
  | UnavailableUpdate
  | UnavailableSuccess
  | RoomSuccess
  | UnavailableSaveSuccess
  | UnavailableFailure
  | UnavailableFind
  | UnavailableSelected
  | DeleteUnavailable
  | Clean;
