import { createAction, props } from '@ngrx/store';
import { IError, PageRequest, IResponseSuccess } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';
import { IRoom, IRoomCustomer, IRoomInfo, IRoomService, IServicePrice } from '../interfaces/room';

enum RoomActionTypes {
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
  clean = '[Room] Clean',
}

export const getRoomsPage = createAction(
  RoomActionTypes.getRoomsPage,
  props<PageRequest>(),
);

export const getServices = createAction(
  RoomActionTypes.getServices,
  props<{ id: string }>(),
);

export const getAllRoomsInfo = createAction(RoomActionTypes.getAllRoomsInfo);

export const roomInfoSuccess = createAction(
  RoomActionTypes.roomInfoSuccess,
  props<{ roomInfo?: IRoomInfo; redirect?: boolean }>(),
);

export const roomSuccess = createAction(
  RoomActionTypes.roomSuccess,
  props<{ data: Pagination<IRoom> }>(),
);

export const createRoom = createAction(
  RoomActionTypes.createRoom,
  props<{ room: IRoom }>(),
);

export const updateRoom = createAction(
  RoomActionTypes.updateRoom,
  props<{ id: string; room: IRoom }>(),
);

export const updateServices = createAction(
  RoomActionTypes.updateServices,
  props<{ id: string; prices: IServicePrice[] }>(),
);

export const roomSaveSuccess = createAction(
  RoomActionTypes.roomSaveSuccess,
  props<IResponseSuccess>(),
);

export const roomFailure = createAction(
  RoomActionTypes.roomFailure,
  props<{ error: IError }>(),
);

export const roomSelected = createAction(
  RoomActionTypes.roomSelected,
  props<{ selected?: IRoom; redirect?: boolean }>(),
);

export const roomServiceSelected = createAction(
  RoomActionTypes.roomServiceSelected,
  props<{ services?: IRoomService }>(),
);

export const getRoom = createAction(
  RoomActionTypes.getRoom,
  props<{ id: string; redirect: boolean }>(),
);

export const deleteRoom = createAction(
  RoomActionTypes.deleteRoom,
  props<{ id: string; room: IRoom }>(),
);

export const getAllCustomersInfo = createAction(
  RoomActionTypes.getAllCustomersInfo,
  props<{ id: string }>(),
);

export const customerInfoSuccess = createAction(
  RoomActionTypes.customerInfoSuccess,
  props<{ customers: IRoomCustomer[] }>(),
);

export const cleanRoom = createAction(RoomActionTypes.clean);
