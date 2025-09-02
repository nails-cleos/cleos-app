import { Action } from '@ngrx/store';

export enum UnavailableActionTypes {
  getUnavailablePage = '[Unavailable] Get unavailable page',
  unavailableSuccess = '[Unavailable] Success',
  getAllProfessional = '[Unavailable] Get all professional',
  getAllRoomsByProfessionalId = '[Unavailable] Get all rooms by professional id',
  roomSuccess = '[Unavailable] Get room success',
  createUnavailable = '[Unavailable] Create unavailable',
  createBlockAgenda = '[Unavailable] create block agenda',
  updateUnavailableById = '[Unavailable] Update unavailable by id',
  unavailableSaveSuccess = '[Unavailable] Save Success',
  unavailableFailure = '[Unavailable] Failure',
  unavailableSelected = '[Unavailable] Selected',
  findUnavailableById = '[Unavailable] Find unavailable by id',
  deleteUnavailableById = '[Unavailable] Delete unavailable by id',
  clean = '[Unavailable] Clean'
}

export class GetUnavailablePage implements Action {
  readonly type = UnavailableActionTypes.getUnavailablePage;

  constructor(public payload: any) {
  }
}

export class GetAllProfessional implements Action {
  readonly type = UnavailableActionTypes.getAllProfessional;
}

export class GetAllRoomsByProfessionalId implements Action {
  readonly type = UnavailableActionTypes.getAllRoomsByProfessionalId;

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

export class CreateUnavailable implements Action {
  readonly type = UnavailableActionTypes.createUnavailable;

  constructor(public payload: any) {
  }
}

export class CreateBlockAgenda implements Action {
  readonly type = UnavailableActionTypes.createBlockAgenda;

  constructor(public payload: any) {
  }
}

export class UpdateUnavailableById implements Action {
  readonly type = UnavailableActionTypes.updateUnavailableById;

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

export class FindUnavailableById implements Action {
  readonly type = UnavailableActionTypes.findUnavailableById;

  constructor(public payload: any) {
  }
}

export class DeleteUnavailableById implements Action {
  readonly type = UnavailableActionTypes.deleteUnavailableById;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = UnavailableActionTypes.clean;
}

export type All =
  | GetUnavailablePage
  | GetAllProfessional
  | GetAllRoomsByProfessionalId
  | CreateUnavailable
  | CreateBlockAgenda
  | UpdateUnavailableById
  | UnavailableSuccess
  | RoomSuccess
  | UnavailableSaveSuccess
  | UnavailableFailure
  | FindUnavailableById
  | UnavailableSelected
  | DeleteUnavailableById
  | Clean;
