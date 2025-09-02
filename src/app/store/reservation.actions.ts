import { Action } from '@ngrx/store';

export enum ReservationActionTypes {
  findPaged = '[Reservation] Find paged',
  getCustomerReservations = '[Reservation] Get customer reservations',
  getAllFilterReservations = '[Reservation] Get all filter reservations',
  getAllGroupingByRoom = '[Reservation] Get all grouping by room',
  getCustomers = '[Reservation] Get customers',
  getCustomerInfo = '[Reservation] Get customer info',
  getAllTreatments = '[Reservation] Get all treatments',
  getAllRooms = '[Reservation] Get all rooms',
  findRooms = '[Reservation] Find rooms',
  findAllAdditionalByGroupId = '[Reservation] find all additional by group id',
  getUpcomingReservation = '[Reservation] Get upcoming reservation',
  searchAvailability = '[Reservation] Search availability',
  customerSearchReservation = '[Reservation] Customer search reservation',
  reservationFind = '[Reservation] Find',
  reservationFindPayments = '[Reservation] Find payments',
  findReservationHistoryById = '[Reservation] Find reservation history by id',
  findTrackingByReservationId = '[Reservation] Find tracking by reservation id',
  executeTrackingByReservationId = '[Reservation] Execute tracking by reservation id',
  updateTrackingByReservationId = '[Reservation] Update tracking by reservation id',
  createReservation = '[Reservation] Create reservation',
  reservationSelected = '[Reservation] Selected',
  deleteReservationById = '[Reservation] Delete reservation by id',
  createReviewByReservationId = '[Reservation] Create review by reservation id',
  findReviewByReservationId = '[Reservation] Find review by reservation id',
  reservationReviewSuccess = '[Reservation] Reservation review success',
  approveReservation = '[Reservation] Approve reservation',
  updateReservationById = '[Reservation] Update reservation by id',
  start = '[Reservation] Start',
  completeReservation = '[Reservation] Complete reservation',
  paymentCompleteReservation = '[Reservation] Payment complete reservation',
  cancelReservation = '[Reservation] Cancel reservation',
  customerCancelReservation = '[Reservation] Customer cancel reservation',
  updateCustomerByReservationId = '[Reservation] Update customer by reservation id',
  updateColorByReservationId = '[Reservation] Update color by reservation id',
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
  findColorsByTreatmentId = '[Reservation] Find colors by treatment id',
  colorsCompleteSuccess = '[Reservation] Colors complete success',
  updateNoteByReservationId = '[Reservation] Update note by reservation id',
  updateDiscountByReservationId = '[Reservation] Update discount by reservation id',
  updateTimestampByReservationId = '[Reservation] Update timestamp by reservation id',
  paymentOptions = '[Reservation] Payment options',
  paymentOptionsSuccess = '[Reservation] Payment options success',
  clean = '[Reservation] Clean'
}

export class FindPaged implements Action {
  readonly type = ReservationActionTypes.findPaged;

  constructor(public payload: any) {
  }
}

export class GetCustomerReservations implements Action {
  readonly type = ReservationActionTypes.getCustomerReservations;

  constructor(public payload: any) {
  }
}

export class GetAllFilterReservations implements Action {
  readonly type = ReservationActionTypes.getAllFilterReservations;

  constructor(public payload: any) {
  }
}

export class GetAllGroupingByRoom implements Action {
  readonly type = ReservationActionTypes.getAllGroupingByRoom;

  constructor(public payload: any) {
  }
}

export class SearchAvailability implements Action {
  readonly type = ReservationActionTypes.searchAvailability;

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

export class GetAllTreatments implements Action {
  readonly type = ReservationActionTypes.getAllTreatments;

  constructor(public payload?: any) {
  }
}

export class GetAllRooms implements Action {
  readonly type = ReservationActionTypes.getAllRooms;

  constructor(public payload?: any) {
  }
}

export class FindRooms implements Action {
  readonly type = ReservationActionTypes.findRooms;
}

export class FindAllAdditionalByGroupId implements Action {
  readonly type = ReservationActionTypes.findAllAdditionalByGroupId;

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

export class CreateReservation implements Action {
  readonly type = ReservationActionTypes.createReservation;

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

export class FindReservationHistoryById implements Action {
  readonly type = ReservationActionTypes.findReservationHistoryById;

  constructor(public payload: any) {
  }
}

export class DeleteReservationById implements Action {
  readonly type = ReservationActionTypes.deleteReservationById;

  constructor(public payload: any) {
  }
}

export class ApproveReservation implements Action {
  readonly type = ReservationActionTypes.approveReservation;

  constructor(public payload: any) {
  }
}

export class UpdateReservationById implements Action {
  readonly type = ReservationActionTypes.updateReservationById;

  constructor(public payload: any) {
  }
}

export class Start implements Action {
  readonly type = ReservationActionTypes.start;

  constructor(public payload: any) {
  }
}

export class CompleteReservation implements Action {
  readonly type = ReservationActionTypes.completeReservation;

  constructor(public payload: any) {
  }
}

export class PaymentCompleteReservation implements Action {
  readonly type = ReservationActionTypes.paymentCompleteReservation;

  constructor(public payload: any) {
  }
}

export class CancelReservation implements Action {
  readonly type = ReservationActionTypes.cancelReservation;

  constructor(public payload: any) {
  }
}

export class CustomerCancelReservation implements Action {
  readonly type = ReservationActionTypes.customerCancelReservation;

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

export class FindTrackingByReservationId implements Action {
  readonly type = ReservationActionTypes.findTrackingByReservationId;

  constructor(public payload: any) {
  }
}

export class ExecuteTrackingByReservationId implements Action {
  readonly type = ReservationActionTypes.executeTrackingByReservationId;

  constructor(public payload: any) {
  }
}

export class UpdateTrackingByReservationId implements Action {
  readonly type = ReservationActionTypes.updateTrackingByReservationId;

  constructor(public payload: any) {
  }
}

export class TrackingSuccess implements Action {
  readonly type = ReservationActionTypes.trackingSuccess;

  constructor(public payload: any) {
  }
}

export class CreateReviewByReservationId implements Action {
  readonly type = ReservationActionTypes.createReviewByReservationId;

  constructor(public payload: any) {
  }
}

export class FindReviewByReservationId implements Action {
  readonly type = ReservationActionTypes.findReviewByReservationId;

  constructor(public payload: any) {
  }
}

export class ReservationReviewSuccess implements Action {
  readonly type = ReservationActionTypes.reservationReviewSuccess;

  constructor(public payload: any) {
  }
}

export class UpdateCustomerByReservationId implements Action {
  readonly type = ReservationActionTypes.updateCustomerByReservationId;

  constructor(public payload: any) {
  }
}

export class UpdateColorByReservationId implements Action {
  readonly type = ReservationActionTypes.updateColorByReservationId;

  constructor(public payload: any) {
  }
}

export class FindColorsByTreatmentId implements Action {
  readonly type = ReservationActionTypes.findColorsByTreatmentId;

  constructor(public payload: any) {
  }
}

export class ColorSuccess implements Action {
  readonly type = ReservationActionTypes.colorsCompleteSuccess;

  constructor(public payload: any) {
  }
}

export class UpdateNoteByReservationId implements Action {
  readonly type = ReservationActionTypes.updateNoteByReservationId;

  constructor(public payload: any) {
  }
}

export class UpdateDiscountByReservationId implements Action {
  readonly type = ReservationActionTypes.updateDiscountByReservationId;

  constructor(public payload: any) {
  }
}

export class UpdateTimestampByReservationId implements Action {
  readonly type = ReservationActionTypes.updateTimestampByReservationId;

  constructor(public payload: any) {
  }
}

export class PaymentOptions implements Action {
  readonly type = ReservationActionTypes.paymentOptions;
}

export class PaymentOptionsSuccess implements Action {
  readonly type = ReservationActionTypes.paymentOptionsSuccess;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = ReservationActionTypes.clean;
}

export type All =
  | FindPaged
  | GetCustomerReservations
  | GetAllFilterReservations
  | GetAllGroupingByRoom
  | SearchAvailability
  | CustomerSearchReservation
  | GetAllCustomers
  | GetCustomerInfo
  | GetAllTreatments
  | GetAllRooms
  | FindRooms
  | FindAllAdditionalByGroupId
  | GetUpcomingReservation
  | CreateReservation
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
  | FindReservationHistoryById
  | ReservationSelected
  | DeleteReservationById
  | ApproveReservation
  | Start
  | UpdateReservationById
  | CompleteReservation
  | PaymentCompleteReservation
  | CancelReservation
  | CustomerCancelReservation
  | StateSuccess
  | FindTrackingByReservationId
  | ExecuteTrackingByReservationId
  | UpdateTrackingByReservationId
  | TrackingSuccess
  | CreateReviewByReservationId
  | FindReviewByReservationId
  | ReservationReviewSuccess
  | ReservationCompleteSuccess
  | UpdateCustomerByReservationId
  | FindColorsByTreatmentId
  | ColorSuccess
  | UpdateNoteByReservationId
  | UpdateDiscountByReservationId
  | UpdateTimestampByReservationId
  | PaymentOptions
  | PaymentOptionsSuccess
  | Clean;
