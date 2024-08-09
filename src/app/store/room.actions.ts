import { Action } from '@ngrx/store';

export enum RoomActionTypes {
  getAll = '[Room] Get all',
  getMyService = '[Room] Get my services',
  getRoomInfo = '[Room] Get room info',
  roomInfoSuccess = '[Room] Info Success',
  roomSuccess = '[Room] Success',
  roomSave = '[Room] Save',
  roomUpdate = '[Room] Update',
  roomServiceUpdate = '[Room] Service update',
  roomSaveSuccess = '[Room] Save Success',
  roomFailure = '[Room] Failure',
  roomSelected = '[Room] Selected',
  roomServiceSelected = '[Room] Selected services',
  roomFind = '[Room] Find',
  roomDelete = '[Room] Delete',
  getCustomerInfo = '[Room] Get customer info',
  customerInfoSuccess = '[Room] Customer info Success',
  clean = '[Room] Clean'
}

export class GetAll implements Action {
  readonly type = RoomActionTypes.getAll;

  constructor(public payload: any) {
  }
}

export class GetMyServices implements Action {
  readonly type = RoomActionTypes.getMyService;

  constructor(public payload: any) {
  }
}

export class GetRoomInfo implements Action {
  readonly type = RoomActionTypes.getRoomInfo;
}

export class RoomInfoSuccess implements Action {
  readonly type = RoomActionTypes.roomInfoSuccess;

  constructor(public payload: any) {
  }
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

export class UpdateMyServices implements Action {
  readonly type = RoomActionTypes.roomServiceUpdate;

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

export class RoomServiceSelected implements Action {
  readonly type = RoomActionTypes.roomServiceSelected;

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

export class GetCustomerInfo implements Action {
  readonly type = RoomActionTypes.getCustomerInfo;

  constructor(public payload: any) {
  }
}

export class CustomerInfoSuccess implements Action {
  readonly type = RoomActionTypes.customerInfoSuccess;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = RoomActionTypes.clean;
}

export type All =
  | GetAll
  | GetMyServices
  | GetRoomInfo
  | RoomInfoSuccess
  | RoomSave
  | RoomUpdate
  | UpdateMyServices
  | RoomSuccess
  | RoomSaveSuccess
  | RoomFailure
  | RoomFind
  | RoomSelected
  | RoomServiceSelected
  | DeleteRoom
  | GetCustomerInfo
  | CustomerInfoSuccess
  | Clean;
