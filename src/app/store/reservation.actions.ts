import { Action } from '@ngrx/store';

export enum ReservationActionTypes {
  getAllPage = '[Reservation] Get all page',
  getCustomerReservations = '[Reservation] Get customer reservations',
  getAllFilterPage = '[Reservation] Get all filter page',
  getAllGroupingByRoom = '[Reservation] Get all grouping by room',
  getCustomers = '[Reservation] Get customers',
  getCustomerInfo = '[Reservation] Get customer info',
  getServices = '[Reservation] Get services',
  getRooms = '[Reservation] Get rooms',
  findRooms = '[Reservation] Find rooms',
  getAdditional = '[Reservation] Get additional',
  getUpcomingReservation = '[Reservation] Get upcoming reservation',
  searchReservation = '[Reservation] Search reservation',
  customerSearchReservation = '[Reservation] Customer search reservation',
  reservationFind = '[Reservation] Find',
  reservationFindPayments = '[Reservation] Find payments',
  reservationFindHistory = '[Reservation] Find history',
  findTracking = '[Reservation] Find tracking',
  executeTracking = '[Reservation] Execute tracking',
  reservationSave = '[Reservation] Save',
  reservationSelected = '[Reservation] Selected',
  reservationDelete = '[Reservation] Delete',
  reservationReview = '[Reservation] Review',
  approve = '[Reservation] Approve',
  edit = '[Reservation] Edit',
  start = '[Reservation] Start',
  complete = '[Reservation] Complete',
  paymentComplete = '[Reservation] Payment complete',
  cancel = '[Reservation] Cancel',
  customerCancel = '[Reservation] Customer cancel',
  changeCustomer = '[Reservation] Change customer reservation',
  stateSuccess = '[Reservation] State success',
  reservationSuccess = '[Reservation] Success',
  reservationPageSuccess = '[Reservation] Page Success',
  reservationFilterPageSuccess = '[Reservation] Filter Page Success',
  customersSuccess = '[Reservation] Customers success',
  customerSuccess = '[Reservation] Customer success',
  reservationTreatmentsSuccess = '[Reservation] Treatments success',
  reservationAdditionalSuccess = '[Reservation] Additional success',
  reservationRoomsSuccess = '[Reservation] Rooms success',
  reservationPaymentsSuccess = '[Reservation] Payments success',
  reservationHistorySuccess = '[Reservation] History success',
  reservationSaveSuccess = '[Reservation] Save Success',
  reservationsCustomerSuccess = '[Reservation] reservations customer Success',
  trackingSuccess = '[Reservation] Tracking success',
  reservationFailure = '[Reservation] Failure',
  reservationCompleteSuccess = '[Reservation] Complete success',
  clean = '[Reservation] Clean'
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

  constructor(public payload: any) {
  }
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

export class GetCustomerInfo implements Action {
  readonly type = ReservationActionTypes.getCustomerInfo;

  constructor(public payload: any) {
  }
}

export class GetAllServices implements Action {
  readonly type = ReservationActionTypes.getServices;

  constructor(public payload?: any) {
  }
}

export class GetAllRooms implements Action {
  readonly type = ReservationActionTypes.getRooms;

  constructor(public payload?: any) {
  }
}

export class FindRooms implements Action {
  readonly type = ReservationActionTypes.findRooms;
}

export class GetAllAdditional implements Action {
  readonly type = ReservationActionTypes.getAdditional;

  constructor(public payload?: any) {
  }
}

export class GetUpcomingReservation implements Action {
  readonly type = ReservationActionTypes.getUpcomingReservation;
}

export class ReservationSuccess implements Action {
  readonly type = ReservationActionTypes.reservationSuccess;

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

export class CustomerSuccess implements Action {
  readonly type = ReservationActionTypes.customerSuccess;

  constructor(public payload: any) {
  }
}

export class ReservationTreatmentsSuccess implements Action {
  readonly type = ReservationActionTypes.reservationTreatmentsSuccess;

  constructor(public payload: any) {
  }
}

export class ReservationRoomsSuccess implements Action {
  readonly type = ReservationActionTypes.reservationRoomsSuccess;

  constructor(public payload: any) {
  }
}

export class ReservationAdditionalSuccess implements Action {
  readonly type = ReservationActionTypes.reservationAdditionalSuccess;

  constructor(public payload: any) {
  }
}

export class ReservationPaymentsSuccess implements Action {
  readonly type = ReservationActionTypes.reservationPaymentsSuccess;

  constructor(public payload: any) {
  }
}

export class ReservationHistorySuccess implements Action {
  readonly type = ReservationActionTypes.reservationHistorySuccess;

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

export class ReservationFindHistory implements Action {
  readonly type = ReservationActionTypes.reservationFindHistory;

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

export class ReservationCompleteSuccess implements Action {
  readonly type = ReservationActionTypes.reservationCompleteSuccess;

  constructor(public payload: any) {
  }
}

export class FindTracking implements Action {
  readonly type = ReservationActionTypes.findTracking;

  constructor(public payload: any) {
  }
}

export class ExecuteTracking implements Action {
  readonly type = ReservationActionTypes.executeTracking;

  constructor(public payload: any) {
  }
}

export class TrackingSuccess implements Action {
  readonly type = ReservationActionTypes.trackingSuccess;

  constructor(public payload: any) {
  }
}

export class ReservationReview implements Action {
  readonly type = ReservationActionTypes.reservationReview;

  constructor(public payload: any) {
  }
}

export class ChangeCustomer implements Action {
  readonly type = ReservationActionTypes.changeCustomer;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = ReservationActionTypes.clean;
}

export type All =
  | GetAllPage
  | GetCustomerReservations
  | GetAllFilterPage
  | GetAllGroupingByRoom
  | SearchReservation
  | CustomerSearchReservation
  | GetAllCustomers
  | GetCustomerInfo
  | GetAllServices
  | GetAllRooms
  | FindRooms
  | GetAllAdditional
  | GetUpcomingReservation
  | ReservationSave
  | ReservationSuccess
  | ReservationPageSuccess
  | ReservationFilterPageSuccess
  | CustomersSuccess
  | CustomerSuccess
  | ReservationTreatmentsSuccess
  | ReservationRoomsSuccess
  | ReservationAdditionalSuccess
  | ReservationPaymentsSuccess
  | ReservationHistorySuccess
  | ReservationSaveSuccess
  | ReservationCustomerSuccess
  | ReservationFailure
  | ReservationFind
  | ReservationFindPayments
  | ReservationFindHistory
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
  | FindTracking
  | ExecuteTracking
  | TrackingSuccess
  | ReservationReview
  | ReservationCompleteSuccess
  | ChangeCustomer
  | Clean;
