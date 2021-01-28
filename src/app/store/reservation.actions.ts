import { Action } from '@ngrx/store';

export enum ReservationActionTypes {
  GET_ALL = '[Reservation] Get all',
  SEARCH_RESERVATION = '[Reservation] Search reservation',
  GET_CUSTOMERS = '[Reservation] Get customers',
  GET_PRODUCTS = '[Reservation] Get products',
  GET_ROOMS = '[Reservation] Get rooms',
  RESERVATION_SUCCESS = '[Reservation] Success',
  RESERVATION_CUSTOMERS_SUCCESS = '[Reservation] Customers success',
  RESERVATION_PRODUCTS_SUCCESS = '[Reservation] Products success',
  RESERVATION_ROOMS_SUCCESS = '[Reservation] Rooms success',
  RESERVATION_SAVE = '[Reservation] Save',
  RESERVATION_UPDATE = '[Reservation] Update',
  RESERVATION_SAVE_SUCCESS = '[Reservation] Save Success',
  RESERVATION_FAILURE = '[Reservation] Failure',
  RESERVATION_SELECTED = '[Reservation] Selected',
  RESERVATION_FIND = '[Reservation] Find',
  RESERVATION_DELETE = '[Reservation] Delete',
  CLEAN = '[Reservation] Clean'
}

export class GetAll implements Action {
  readonly type = ReservationActionTypes.GET_ALL;

  constructor(public payload: any) {
  }
}

export class SearchReservation implements Action {
  readonly type = ReservationActionTypes.SEARCH_RESERVATION;

  constructor(public payload: any) {
  }
}

export class GetAllCustomers implements Action {
  readonly type = ReservationActionTypes.GET_CUSTOMERS;
}

export class GetAllProducts implements Action {
  readonly type = ReservationActionTypes.GET_PRODUCTS;
}

export class GetAllRooms implements Action {
  readonly type = ReservationActionTypes.GET_ROOMS;
}

export class ReservationSuccess implements Action {
  readonly type = ReservationActionTypes.RESERVATION_SUCCESS;

  constructor(public payload: any) {
  }
}

export class ReservationCustomersSuccess implements Action {
  readonly type = ReservationActionTypes.RESERVATION_CUSTOMERS_SUCCESS;

  constructor(public payload: any) {
  }
}

export class ReservationProductsSuccess implements Action {
  readonly type = ReservationActionTypes.RESERVATION_PRODUCTS_SUCCESS;

  constructor(public payload: any) {
  }
}

export class ReservationRoomsSuccess implements Action {
  readonly type = ReservationActionTypes.RESERVATION_ROOMS_SUCCESS;

  constructor(public payload: any) {
  }
}

export class ReservationSave implements Action {
  readonly type = ReservationActionTypes.RESERVATION_SAVE;

  constructor(public payload: any) {
  }
}

export class ReservationUpdate implements Action {
  readonly type = ReservationActionTypes.RESERVATION_UPDATE;

  constructor(public payload: any) {
  }
}

export class ReservationSaveSuccess implements Action {
  readonly type = ReservationActionTypes.RESERVATION_SAVE_SUCCESS;

  constructor(public payload: any) {
  }
}

export class ReservationFailure implements Action {
  readonly type = ReservationActionTypes.RESERVATION_FAILURE;

  constructor(public payload: any) {
  }
}

export class ReservationSelected implements Action {
  readonly type = ReservationActionTypes.RESERVATION_SELECTED;

  constructor(public payload: any) {
  }
}

export class ReservationFind implements Action {
  readonly type = ReservationActionTypes.RESERVATION_FIND;

  constructor(public payload: any) {
  }
}

export class DeleteReservation implements Action {
  readonly type = ReservationActionTypes.RESERVATION_DELETE;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = ReservationActionTypes.CLEAN;
}

export type All =
  | GetAll
  | SearchReservation
  | GetAllCustomers
  | GetAllProducts
  | GetAllRooms
  | ReservationSave
  | ReservationUpdate
  | ReservationSuccess
  | ReservationCustomersSuccess
  | ReservationProductsSuccess
  | ReservationRoomsSuccess
  | ReservationSaveSuccess
  | ReservationFailure
  | ReservationFind
  | ReservationSelected
  | DeleteReservation
  | Clean;
