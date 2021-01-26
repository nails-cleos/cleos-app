import { Action } from '@ngrx/store';

export enum RoomActionTypes {
  GET_ALL = '[Room] Get all',
  GET_ALL_PROFESSIONAL = '[Room] Get all professional',
  ROOM_SUCCESS = '[Room] Success',
  ROOM_SAVE = '[Room] Save',
  ROOM_UPDATE = '[Room] Update',
  ROOM_SAVE_SUCCESS = '[Room] Save Success',
  ROOM_FAILURE = '[Room] Failure',
  ROOM_SELECTED = '[Room] Selected',
  ROOM_FIND = '[Room] Find',
  ROOM_DELETE = '[Room] Delete',
  CLEAN = '[Room] Clean'
}

export class GetAll implements Action {
  readonly type = RoomActionTypes.GET_ALL;

  constructor(public payload: any) {
  }
}

export class GetAllProfessional implements Action {
  readonly type = RoomActionTypes.GET_ALL_PROFESSIONAL;
}

export class RoomSuccess implements Action {
  readonly type = RoomActionTypes.ROOM_SUCCESS;

  constructor(public payload: any) {
  }
}

export class RoomSave implements Action {
  readonly type = RoomActionTypes.ROOM_SAVE;

  constructor(public payload: any) {
  }
}

export class RoomUpdate implements Action {
  readonly type = RoomActionTypes.ROOM_UPDATE;

  constructor(public payload: any) {
  }
}

export class RoomSaveSuccess implements Action {
  readonly type = RoomActionTypes.ROOM_SAVE_SUCCESS;

  constructor(public payload: any) {
  }
}

export class RoomFailure implements Action {
  readonly type = RoomActionTypes.ROOM_FAILURE;

  constructor(public payload: any) {
  }
}

export class RoomSelected implements Action {
  readonly type = RoomActionTypes.ROOM_SELECTED;

  constructor(public payload: any) {
  }
}

export class RoomFind implements Action {
  readonly type = RoomActionTypes.ROOM_FIND;

  constructor(public payload: any) {
  }
}

export class DeleteRoom implements Action {
  readonly type = RoomActionTypes.ROOM_DELETE;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = RoomActionTypes.CLEAN;
}

export type All =
  | GetAll
  | GetAllProfessional
  | RoomSave
  | RoomUpdate
  | RoomSuccess
  | RoomSaveSuccess
  | RoomFailure
  | RoomFind
  | RoomSelected
  | DeleteRoom
  | Clean;
