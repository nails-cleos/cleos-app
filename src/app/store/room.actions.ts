import { Action } from '@ngrx/store';

export enum RoomActionTypes {
  getRoomsPage = '[Room] Get rooms page',
  findRoomServicesById = '[Room] Find room services by id',
  getAllRoomsInfo = '[Room] Get all rooms info',
  roomInfoSuccess = '[Room] Info Success',
  roomSuccess = '[Room] Success',
  createRoom = '[Room] Create room',
  updateRoomById = '[Room] Update room by id',
  updateRoomServicesById = '[Room] Update room services by id',
  roomSaveSuccess = '[Room] Save Success',
  roomFailure = '[Room] Failure',
  roomSelected = '[Room] Selected',
  roomServiceSelected = '[Room] Selected services',
  findRoomById = '[Room] Find room by id',
  deleteRoomById = '[Room] Delete room by id',
  getAllCustomersInfo = '[Room] Get all customers info',
  customerInfoSuccess = '[Room] Customer info Success',
  clean = '[Room] Clean'
}

export class GetRoomsPage implements Action {
  readonly type = RoomActionTypes.getRoomsPage;

  constructor(public payload: any) {
  }
}

export class FindRoomServicesById implements Action {
  readonly type = RoomActionTypes.findRoomServicesById;

  constructor(public payload: any) {
  }
}

export class GetAllRoomsInfo implements Action {
  readonly type = RoomActionTypes.getAllRoomsInfo;
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

export class CreateRoom implements Action {
  readonly type = RoomActionTypes.createRoom;

  constructor(public payload: any) {
  }
}

export class UpdateRoomById implements Action {
  readonly type = RoomActionTypes.updateRoomById;

  constructor(public payload: any) {
  }
}

export class UpdateRoomServicesById implements Action {
  readonly type = RoomActionTypes.updateRoomServicesById;

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

export class FindRoomById implements Action {
  readonly type = RoomActionTypes.findRoomById;

  constructor(public payload: any) {
  }
}

export class DeleteRoomById implements Action {
  readonly type = RoomActionTypes.deleteRoomById;

  constructor(public payload: any) {
  }
}

export class GetAllCustomersInfo implements Action {
  readonly type = RoomActionTypes.getAllCustomersInfo;

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
  | GetRoomsPage
  | FindRoomServicesById
  | GetAllRoomsInfo
  | RoomInfoSuccess
  | CreateRoom
  | UpdateRoomById
  | UpdateRoomServicesById
  | RoomSuccess
  | RoomSaveSuccess
  | RoomFailure
  | FindRoomById
  | RoomSelected
  | RoomServiceSelected
  | DeleteRoomById
  | GetAllCustomersInfo
  | CustomerInfoSuccess
  | Clean;
