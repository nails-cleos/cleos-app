import { Action } from '@ngrx/store';

export enum RoomActionTypes {
  getAll = '[Room] Get all',
  getMyRoom = '[Room] Get my room',
  getAllProfessional = '[Room] Get all professional',
  roomSuccess = '[Room] Success',
  roomSave = '[Room] Save',
  roomUpdate = '[Room] Update',
  roomUpdateMe = '[Room] Update me',
  roomSaveSuccess = '[Room] Save Success',
  roomFailure = '[Room] Failure',
  roomSelected = '[Room] Selected',
  roomFind = '[Room] Find',
  roomDelete = '[Room] Delete',
  clean = '[Room] Clean'
}

export class GetAll implements Action {
  readonly type = RoomActionTypes.getAll;

  constructor(public payload: any) {
  }
}

export class GetMyRoom implements Action {
  readonly type = RoomActionTypes.getMyRoom;
}

export class GetAllProfessional implements Action {
  readonly type = RoomActionTypes.getAllProfessional;
}

export class RoomSuccess implements Action {
  readonly type = RoomActionTypes.roomSuccess;

  constructor(public payload: any) {
  }
}

export class RoomSave implements Action {
  readonly type = RoomActionTypes.roomSave;

  constructor(public payload: any) {
  }
}

export class RoomUpdate implements Action {
  readonly type = RoomActionTypes.roomUpdate;

  constructor(public payload: any) {
  }
}

export class RoomUpdateMe implements Action {
  readonly type = RoomActionTypes.roomUpdateMe;

  constructor(public payload: any) {
  }
}

export class RoomSaveSuccess implements Action {
  readonly type = RoomActionTypes.roomSaveSuccess;

  constructor(public payload: any) {
  }
}

export class RoomFailure implements Action {
  readonly type = RoomActionTypes.roomFailure;

  constructor(public payload: any) {
  }
}

export class RoomSelected implements Action {
  readonly type = RoomActionTypes.roomSelected;

  constructor(public payload: any) {
  }
}

export class RoomFind implements Action {
  readonly type = RoomActionTypes.roomFind;

  constructor(public payload: any) {
  }
}

export class DeleteRoom implements Action {
  readonly type = RoomActionTypes.roomDelete;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = RoomActionTypes.clean;
}

export type All =
  | GetAll
  | GetMyRoom
  | GetAllProfessional
  | RoomSave
  | RoomUpdate
  | RoomUpdateMe
  | RoomSuccess
  | RoomSaveSuccess
  | RoomFailure
  | RoomFind
  | RoomSelected
  | DeleteRoom
  | Clean;
