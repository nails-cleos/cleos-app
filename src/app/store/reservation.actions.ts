import { Action } from '@ngrx/store';

export enum ReservationActionTypes {
  getAll = '[Reservation] Get all',
  getAllPage = '[Reservation] Get all page',
  getCustomerReservations = '[Reservation] Get customer reservations',
  getAllFilterPage = '[Reservation] Get all filter page',
  getAllGroupingByRoom = '[Reservation] Get all grouping by room',
  searchReservation = '[Reservation] Search reservation',
  customerSearchReservation = '[Reservation] Customer search reservation',
  getCustomers = '[Reservation] Get customers',
  getProducts = '[Reservation] Get products',
  getRooms = '[Reservation] Get rooms',
  getUpcomingReservation = '[Reservation] Get upcoming reservation',
  reservationSuccess = '[Reservation] Success',
  reservationDashSuccess = '[Reservation] Dash Success',
  reservationPageSuccess = '[Reservation] Page Success',
  reservationFilterPageSuccess = '[Reservation] Filter Page Success',
  customersSuccess = '[Reservation] Customers success',
  reservationProductsSuccess = '[Reservation] Products success',
  reservationRoomsSuccess = '[Reservation] Rooms success',
  reservationPaymentsSuccess = '[Reservation] Payments success',
  reservationSave = '[Reservation] Save',
  reservationSaveSuccess = '[Reservation] Save Success',
  reservationsCustomerSuccess = '[Reservation] reservations customer Success',
  reservationFailure = '[Reservation] Failure',
  reservationSelected = '[Reservation] Selected',
  reservationFind = '[Reservation] Find',
  reservationFindPayments = '[Reservation] Find payments',
  reservationDelete = '[Reservation] Delete',
  approve = '[Reservation] Approve',
  edit = '[Reservation] Edit',
  start = '[Reservation] Start',
  complete = '[Reservation] Complete',
  paymentComplete = '[Reservation] Payment complete',
  cancel = '[Reservation] Cancel',
  customerCancel = '[Reservation] Customer cancel',
  stateSuccess = '[Reservation] State success',
  getTracking = '[Reservation] Get tracking',
  findTracking = '[Reservation] Find tracking',
  trackingSuccess = '[Reservation] Tracking success',
  clean = '[Reservation] Clean'
}

export class GetAll implements Action {
  readonly type = ReservationActionTypes.getAll;
}

export class GetAllPage implements Action {
  readonly type = ReservationActionTypes.getAllPage;

  constructor(public payload: any) {
  }
}

export class GetCustomerReservations implements Action {
  readonly type = ReservationActionTypes.getCustomerReservations;

  constructor(public payload: any) {
  }
}

export class GetAllFilterPage implements Action {
  readonly type = ReservationActionTypes.getAllFilterPage;

  constructor(public payload: any) {
  }
}

export class GetAllGroupingByRoom implements Action {
  readonly type = ReservationActionTypes.getAllGroupingByRoom;
}

export class SearchReservation implements Action {
  readonly type = ReservationActionTypes.searchReservation;

  constructor(public payload: any) {
  }
}

export class CustomerSearchReservation implements Action {
  readonly type = ReservationActionTypes.customerSearchReservation;

  constructor(public payload: any) {
  }
}

export class GetAllCustomers implements Action {
  readonly type = ReservationActionTypes.getCustomers;
}

export class GetAllProducts implements Action {
  readonly type = ReservationActionTypes.getProducts;

  constructor(public payload?: any) {
  }
}

export class GetAllRooms implements Action {
  readonly type = ReservationActionTypes.getRooms;
}

export class GetUpcomingReservation implements Action {
  readonly type = ReservationActionTypes.getUpcomingReservation;
}

export class ReservationSuccess implements Action {
  readonly type = ReservationActionTypes.reservationSuccess;

  constructor(public payload: any) {
  }
}

export class ReservationDashSuccess implements Action {
  readonly type = ReservationActionTypes.reservationDashSuccess;

  constructor(public payload: any) {
  }
}

export class ReservationPageSuccess implements Action {
  readonly type = ReservationActionTypes.reservationPageSuccess;

  constructor(public payload: any) {
  }
}

export class ReservationFilterPageSuccess implements Action {
  readonly type = ReservationActionTypes.reservationFilterPageSuccess;

  constructor(public payload: any) {
  }
}

export class CustomersSuccess implements Action {
  readonly type = ReservationActionTypes.customersSuccess;

  constructor(public payload: any) {
  }
}

export class ReservationProductsSuccess implements Action {
  readonly type = ReservationActionTypes.reservationProductsSuccess;

  constructor(public payload: any) {
  }
}

export class ReservationRoomsSuccess implements Action {
  readonly type = ReservationActionTypes.reservationRoomsSuccess;

  constructor(public payload: any) {
  }
}

export class ReservationPaymentsSuccess implements Action {
  readonly type = ReservationActionTypes.reservationPaymentsSuccess;

  constructor(public payload: any) {
  }
}

export class ReservationSave implements Action {
  readonly type = ReservationActionTypes.reservationSave;

  constructor(public payload: any) {
  }
}

export class ReservationSaveSuccess implements Action {
  readonly type = ReservationActionTypes.reservationSaveSuccess;

  constructor(public payload: any) {
  }
}

export class ReservationCustomerSuccess implements Action {
  readonly type = ReservationActionTypes.reservationsCustomerSuccess;

  constructor(public payload: any) {
  }
}

export class ReservationFailure implements Action {
  readonly type = ReservationActionTypes.reservationFailure;

  constructor(public payload: any) {
  }
}

export class ReservationSelected implements Action {
  readonly type = ReservationActionTypes.reservationSelected;

  constructor(public payload: any) {
  }
}

export class ReservationFind implements Action {
  readonly type = ReservationActionTypes.reservationFind;

  constructor(public payload: any) {
  }
}

export class ReservationFindPayments implements Action {
  readonly type = ReservationActionTypes.reservationFindPayments;

  constructor(public payload: any) {
  }
}

export class DeleteReservation implements Action {
  readonly type = ReservationActionTypes.reservationDelete;

  constructor(public payload: any) {
  }
}

export class Approve implements Action {
  readonly type = ReservationActionTypes.approve;

  constructor(public payload: any) {
  }
}

export class Edit implements Action {
  readonly type = ReservationActionTypes.edit;

  constructor(public payload: any) {
  }
}

export class Start implements Action {
  readonly type = ReservationActionTypes.start;

  constructor(public payload: any) {
  }
}

export class Complete implements Action {
  readonly type = ReservationActionTypes.complete;

  constructor(public payload: any) {
  }
}

export class PaymentComplete implements Action {
  readonly type = ReservationActionTypes.paymentComplete;

  constructor(public payload: any) {
  }
}

export class Cancel implements Action {
  readonly type = ReservationActionTypes.cancel;

  constructor(public payload: any) {
  }
}

export class CustomerCancel implements Action {
  readonly type = ReservationActionTypes.customerCancel;

  constructor(public payload: any) {
  }
}

export class StateSuccess implements Action {
  readonly type = ReservationActionTypes.stateSuccess;

  constructor(public payload: any) {
  }
}

export class GetTracking implements Action {
  readonly type = ReservationActionTypes.getTracking;
}

export class FindTracking implements Action {
  readonly type = ReservationActionTypes.findTracking;

  constructor(public payload: any) {
  }
}

export class TrackingSuccess implements Action {
  readonly type = ReservationActionTypes.trackingSuccess;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = ReservationActionTypes.clean;
}

export type All =
  | GetAll
  | GetAllPage
  | GetCustomerReservations
  | GetAllFilterPage
  | GetAllGroupingByRoom
  | SearchReservation
  | CustomerSearchReservation
  | GetAllCustomers
  | GetAllProducts
  | GetAllRooms
  | GetUpcomingReservation
  | ReservationSave
  | ReservationSuccess
  | ReservationDashSuccess
  | ReservationPageSuccess
  | ReservationFilterPageSuccess
  | CustomersSuccess
  | ReservationProductsSuccess
  | ReservationRoomsSuccess
  | ReservationPaymentsSuccess
  | ReservationSaveSuccess
  | ReservationCustomerSuccess
  | ReservationFailure
  | ReservationFind
  | ReservationFindPayments
  | ReservationSelected
  | DeleteReservation
  | Approve
  | Start
  | Edit
  | Complete
  | PaymentComplete
  | Cancel
  | CustomerCancel
  | StateSuccess
  | GetTracking
  | FindTracking
  | TrackingSuccess
  | Clean;
