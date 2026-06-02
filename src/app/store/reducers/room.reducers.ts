import { Pagination } from '../../interfaces/pagination';
import {
  cleanRoom,
  createRoom,
  customerInfoSuccess,
  deleteRoom,
  getAllCustomersInfo,
  getAllRoomsInfo,
  getRoom,
  getRoomsPage,
  getServices,
  roomFailure,
  roomInfoSuccess,
  roomSaveSuccess,
  roomSelected,
  roomServiceSelected,
  roomSuccess,
  updateRoom,
  updateServices,
} from '../actions/room.actions';
import { IRoom, IRoomCustomer, IRoomService } from '../../interfaces/room';
import { IUserAll } from '../../interfaces/user';
import { ICurrencyAll } from '../../interfaces/currency';
import { IError, IResponseSuccess } from '../../interfaces/common';

import { createReducer, on } from '@ngrx/store';
import { IOfficeAll } from '../../interfaces/office';
import { clearGlobalError, clearGlobalResponse } from '../actions/global.actions';

export const ROOM_FEATURE_KEY = 'room';

export interface RoomState {
  response?: IResponseSuccess;
  data?: Pagination<IRoom>;
  services?: IRoomService;
  professionals?: IUserAll[];
  currencies?: ICurrencyAll[];
  offices?: IOfficeAll[];
  customers?: IRoomCustomer[];
  error?: IError;
  subErrors?: IError[];
  selected?: IRoom;
  isLoading: boolean;
}

export const initialState: RoomState = {
  data: undefined,
  services: undefined,
  professionals: undefined,
  currencies: undefined,
  offices: undefined,
  customers: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const roomReducer = createReducer(
  initialState,
  on(getRoomsPage, (state) => ({
    ...state,
    data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IRoom>,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllRoomsInfo, (state) => ({
    ...state,
    professionals: undefined,
    currencies: undefined,
    offices: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getRoom, (state) => ({
    ...state,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getServices, (state) => ({
    ...state,
    services: {} as IRoomService,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(roomInfoSuccess, (state, { roomInfo }) => ({
    ...state,
    professionals: roomInfo?.professionals,
    offices: roomInfo?.offices,
    currencies: roomInfo?.currencies,
    subErrors: undefined,
    response: undefined,
  })),
  on(roomSuccess, (state, { data }) => ({
    ...state,
    data,
    subErrors: undefined,
    response: undefined,
  })),
  on(roomSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    selected: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(roomSelected, (state, { selected }) => ({
    ...state,
    selected,
    subErrors: undefined,
    response: undefined,
  })),
  on(roomServiceSelected, (state, { services }) => ({
    ...state,
    services,
    subErrors: undefined,
    response: undefined,
  })),
  on(roomFailure, (state, { error }) => ({
    ...state,
    error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(
    updateServices,
    updateRoom,
    createRoom,
    deleteRoom,
    (state) => ({
      ...state,
      selected: undefined,
      subErrors: undefined,
      response: undefined,
      isLoading: true,
    }),
  ),
  on(getAllCustomersInfo, (state) => ({
    ...state,
    customers: [{}, {}, {}],
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(customerInfoSuccess, (state, { customers }) => ({
    ...state,
    customers,
    subErrors: undefined,
    response: undefined,
  })),
  on(cleanRoom, () => initialState),

  on(clearGlobalResponse, (state) => ({
    ...state,
    response: undefined,
  })),

  on(clearGlobalError, (state) => ({
    ...state,
    error: undefined,
    subErrors: undefined,
  })),
);
