import { Action } from '@ngrx/store';
import { Pagination } from '../interfaces/pagination';
import { IUnavailable } from '../interfaces/unavailable';
import { IError, PageRequest, ResponseSuccess } from '../interfaces/common';
import { IUser } from '../interfaces/user';
import { IRoom } from '../interfaces/room';

export enum UnavailableActionTypes {
  getUnavailablePage = '[Unavailable] Get unavailable page',
  unavailableSuccess = '[Unavailable] Success',
  getAllProfessional = '[Unavailable] Get all professional',
  getAllRoomsByProfessionalId = '[Unavailable] Get all rooms by professional id',
  roomSuccess = '[Unavailable] Get room success',
  professionalSuccess = '[Unavailable] Get professional success',
  createUnavailable = '[Unavailable] Create unavailable',
  createBlockAgenda = '[Unavailable] create block agenda',
  updateUnavailable = '[Unavailable] Update unavailable by id',
  unavailableSaveSuccess = '[Unavailable] Save Success',
  unavailableFailure = '[Unavailable] Failure',
  unavailableSelected = '[Unavailable] Selected',
  getUnavailable = '[Unavailable] Find unavailable by id',
  deleteUnavailable = '[Unavailable] Delete unavailable by id',
  clean = '[Unavailable] Clean'
}

export class GetUnavailablePage extends PageRequest implements Action {
  readonly type = UnavailableActionTypes.getUnavailablePage;
}

export class GetAllProfessional implements Action {
  readonly type = UnavailableActionTypes.getAllProfessional;
}

export class GetAllRoomsByProfessionalId implements Action {
  readonly type = UnavailableActionTypes.getAllRoomsByProfessionalId;

  constructor(public professionalId: string) {
  }
}

export class UnavailableSuccess implements Action {
  readonly type = UnavailableActionTypes.unavailableSuccess;

  constructor(public data: Pagination<IUnavailable>) {
  }
}

export class RoomSuccess implements Action {
  readonly type = UnavailableActionTypes.roomSuccess;

  constructor(public rooms: IRoom[]) {
  }
}

export class ProfessionalSuccess implements Action {
  readonly type = UnavailableActionTypes.professionalSuccess;

  constructor(public professionals: IUser[]) {
  }
}

export class CreateUnavailable implements Action {
  readonly type = UnavailableActionTypes.createUnavailable;

  constructor(public unavailable: IUnavailable) {
  }
}

export class CreateBlockAgenda implements Action {
  readonly type = UnavailableActionTypes.createBlockAgenda;

  constructor(public unavailable: IUnavailable) {
  }
}

export class UpdateUnavailable implements Action {
  readonly type = UnavailableActionTypes.updateUnavailable;

  constructor(public id: string, public unavailable: IUnavailable, public path: string) {
  }
}

export class UnavailableSaveSuccess extends ResponseSuccess implements Action {
  readonly type = UnavailableActionTypes.unavailableSaveSuccess;
}

export class UnavailableFailure implements Action {
  readonly type = UnavailableActionTypes.unavailableFailure;

  constructor(public error: IError) {
  }
}

export class UnavailableSelected implements Action {
  readonly type = UnavailableActionTypes.unavailableSelected;

  constructor(public selected?: IUnavailable) {
  }
}

export class GetUnavailable implements Action {
  readonly type = UnavailableActionTypes.getUnavailable;

  constructor(public id: string) {
  }
}

export class DeleteUnavailable implements Action {
  readonly type = UnavailableActionTypes.deleteUnavailable;

  constructor(public id: string, public timestamp: number, public timeZone?: string) {
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
  | UpdateUnavailable
  | UnavailableSuccess
  | RoomSuccess
  | ProfessionalSuccess
  | UnavailableSaveSuccess
  | UnavailableFailure
  | GetUnavailable
  | UnavailableSelected
  | DeleteUnavailable
  | Clean;
