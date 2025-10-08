import { Action } from '@ngrx/store';
import { IError, PageRequest, ResponseSuccess } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';
import { IRoom, IRoomCustomer, IRoomInfo, IRoomService, IServicePrice } from '../interfaces/room';

export enum RoomActionTypes {
  getRoomsPage = '[Room] Get rooms page',
  getServices = '[Room] Find room services by id',
  getAllRoomsInfo = '[Room] Get all rooms info',
  roomInfoSuccess = '[Room] Info Success',
  roomSuccess = '[Room] Success',
  createRoom = '[Room] Create room',
  updateRoom = '[Room] Update room by id',
  updateServices = '[Room] Update room services by id',
  roomSaveSuccess = '[Room] Save Success',
  roomFailure = '[Room] Failure',
  roomSelected = '[Room] Selected',
  roomServiceSelected = '[Room] Selected services',
  getRoom = '[Room] Find room by id',
  deleteRoom = '[Room] Delete room by id',
  getAllCustomersInfo = '[Room] Get all customers info',
  customerInfoSuccess = '[Room] Customer info Success',
  clean = '[Room] Clean'
}

export class GetRoomsPage extends PageRequest implements Action {
  readonly type = RoomActionTypes.getRoomsPage;
}

export class GetServices implements Action {
  readonly type = RoomActionTypes.getServices;

  constructor(public id: string) {
  }
}

export class GetAllRoomsInfo implements Action {
  readonly type = RoomActionTypes.getAllRoomsInfo;
}

export class RoomInfoSuccess implements Action {
  readonly type = RoomActionTypes.roomInfoSuccess;

  constructor(public roomInfo?: IRoomInfo, public redirect?: boolean) {
  }
}

export class RoomSuccess implements Action {
  readonly type = RoomActionTypes.roomSuccess;

  constructor(public data: Pagination<IRoom>) {
  }
}

export class CreateRoom implements Action {
  readonly type = RoomActionTypes.createRoom;

  constructor(public room: IRoom) {
  }
}

export class UpdateRoom implements Action {
  readonly type = RoomActionTypes.updateRoom;

  constructor(public id: string, public room: IRoom) {
  }
}

export class UpdateServices implements Action {
  readonly type = RoomActionTypes.updateServices;

  constructor(public id: string, public prices: IServicePrice[]) {
  }
}

export class RoomSaveSuccess extends ResponseSuccess implements Action {
  readonly type = RoomActionTypes.roomSaveSuccess;
}

export class RoomFailure implements Action {
  readonly type = RoomActionTypes.roomFailure;

  constructor(public error: IError) {
  }
}

export class RoomSelected implements Action {
  readonly type = RoomActionTypes.roomSelected;

  constructor(public selected?: IRoom, public redirect?: boolean) {
  }
}

export class RoomServiceSelected implements Action {
  readonly type = RoomActionTypes.roomServiceSelected;

  constructor(public services?: IRoomService) {
  }
}

export class GetRoom implements Action {
  readonly type = RoomActionTypes.getRoom;

  constructor(public id: string, public redirect: boolean) {
  }
}

export class DeleteRoom implements Action {
  readonly type = RoomActionTypes.deleteRoom;

  constructor(public id: string, public room: IRoom) {
  }
}

export class GetAllCustomersInfo implements Action {
  readonly type = RoomActionTypes.getAllCustomersInfo;

  constructor(public id: string) {
  }
}

export class CustomerInfoSuccess implements Action {
  readonly type = RoomActionTypes.customerInfoSuccess;

  constructor(public customers: IRoomCustomer[]) {
  }
}

export class Clean implements Action {
  readonly type = RoomActionTypes.clean;
}

export type All =
  | GetRoomsPage
  | GetServices
  | GetAllRoomsInfo
  | RoomInfoSuccess
  | CreateRoom
  | UpdateRoom
  | UpdateServices
  | RoomSuccess
  | RoomSaveSuccess
  | RoomFailure
  | GetRoom
  | RoomSelected
  | RoomServiceSelected
  | DeleteRoom
  | GetAllCustomersInfo
  | CustomerInfoSuccess
  | Clean;
