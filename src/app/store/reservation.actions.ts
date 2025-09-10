import { Action } from '@ngrx/store';
import { IError, PageRequest, ResponseSuccess } from '../interfaces/common';
import { SortDirection } from '@angular/material/sort';
import {
  ICustomerLastReservation,
  ICustomerReservation,
  IReservation,
  IRoomReservation,
  ITracking,
} from '../interfaces/reservation';
import { Pagination } from '../interfaces/pagination';
import { IUser } from '../interfaces/user';
import { ITreatmentDiscountDTO } from '../interfaces/treatment';
import { IRoom } from '../interfaces/room';
import { IAdditional } from '../interfaces/additional';
import { IPayment, IPaymentOption } from '../interfaces/payment';
import { Role } from '../interfaces/token';
import { IReview } from '../interfaces/review';
import { IColor } from '../interfaces/color';
import { ToastType } from '../shared/toast/toast.model';

export enum ReservationActionTypes {
  getPage = '[Reservation] Find paged',
  getCustomerReservations = '[Reservation] Get customer reservations',
  getAllFilterReservations = '[Reservation] Get all filter reservations',
  getAllGroupingByRoom = '[Reservation] Get all grouping by room',
  getCustomers = '[Reservation] Get customers',
  getCustomerInformation = '[Reservation] Get customer info',
  getAllTreatments = '[Reservation] Get all treatments',
  getAllRooms = '[Reservation] Get all rooms',
  findRooms = '[Reservation] Find rooms',
  getAllAdditionalByGroupId = '[Reservation] find all additional by group id',
  getUpcomingReservation = '[Reservation] Get upcoming reservation',
  searchAvailability = '[Reservation] Search availability',
  customerSearchReservation = '[Reservation] Customer search reservation',
  getReservation = '[Reservation] Find',
  getEditReservation = '[Reservation] Find edit',
  reservationFindPayments = '[Reservation] Find payments',
  getReservationHistory = '[Reservation] Find reservation history by id',
  getTrackingByReservationId = '[Reservation] Find tracking by reservation id',
  executeTrackingByReservationId = '[Reservation] Execute tracking by reservation id',
  updateTrackingByReservationId = '[Reservation] Update tracking by reservation id',
  createReservation = '[Reservation] Create reservation',
  reservationSelected = '[Reservation] Selected',
  deleteReservation = '[Reservation] Delete reservation by id',
  createReview = '[Reservation] Create review by reservation id',
  getReview = '[Reservation] Find review by reservation id',
  reservationReviewSuccess = '[Reservation] Reservation review success',
  approveReservation = '[Reservation] Approve reservation',
  updateReservationById = '[Reservation] Update reservation by id',
  start = '[Reservation] Start',
  completeReservation = '[Reservation] Complete reservation',
  paymentCompleteReservation = '[Reservation] Payment complete reservation',
  cancelReservation = '[Reservation] Cancel reservation',
  customerCancelReservation = '[Reservation] Customer cancel reservation',
  updateReservationCustomer = '[Reservation] Update customer by reservation id',
  updateReservationColor = '[Reservation] Update color by reservation id',
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
  getColorsByTreatmentId = '[Reservation] Find colors by treatment id',
  colorsCompleteSuccess = '[Reservation] Colors complete success',
  updateReservationNote = '[Reservation] Update note by reservation id',
  updateReservationDiscount = '[Reservation] Update discount by reservation id',
  updateReservationTimestamp = '[Reservation] Update timestamp by reservation id',
  paymentOptions = '[Reservation] Payment options',
  paymentOptionsSuccess = '[Reservation] Payment options success',
  clean = '[Reservation] Clean'
}

export class GetPage extends PageRequest implements Action {
  readonly type = ReservationActionTypes.getPage;

  constructor(public page: number, public sort: string, public direction: SortDirection,
              public size: number, public roomId?: string, public all?: boolean, public professionalId?: string) {
    super(page, sort, direction, size);
  }
}

export class GetCustomerReservations extends PageRequest implements Action {
  readonly type = ReservationActionTypes.getCustomerReservations;
}

export class GetAllFilterReservations extends PageRequest implements Action {
  readonly type = ReservationActionTypes.getAllFilterReservations;

  constructor(public page: number, public sort: string, public direction: SortDirection,
              public size: number, public userId?: string, public states?: string[]) {
    super(page, sort, direction, size);
  }
}

export class GetAllGroupingByRoom implements Action {
  readonly type = ReservationActionTypes.getAllGroupingByRoom;

  constructor(public days: number, public date: Date, public roomId: string, public professionalId?: string) {
  }
}

export class SearchAvailability implements Action {
  readonly type = ReservationActionTypes.searchAvailability;

  constructor(public days: number, public dates: Date[], public roomId: string, public professionalId?: string) {
  }
}

export class CustomerSearchReservation implements Action {
  readonly type = ReservationActionTypes.customerSearchReservation;

  constructor(public roomId: string, public treatmentId: string, public date: Date, public professionalId: string,
              public additionalIds?: string[]) {
  }
}

export class GetCustomers implements Action {
  readonly type = ReservationActionTypes.getCustomers;
}

export class GetCustomerInformation implements Action {
  readonly type = ReservationActionTypes.getCustomerInformation;

  constructor(public id: string) {
  }
}

export class GetAllTreatments implements Action {
  readonly type = ReservationActionTypes.getAllTreatments;

  constructor(public roomId: string, public customerId?: string) {
  }
}

export class GetAllRooms implements Action {
  readonly type = ReservationActionTypes.getAllRooms;

  constructor(public customerId?: string) {
  }
}

export class FindRooms implements Action {
  readonly type = ReservationActionTypes.findRooms;
}

export class GetAllAdditionalByGroupId implements Action {
  readonly type = ReservationActionTypes.getAllAdditionalByGroupId;

  constructor(public roomId: string, public groupId: string) {
  }
}

export class GetUpcomingReservation implements Action {
  readonly type = ReservationActionTypes.getUpcomingReservation;
}

export class ReservationSuccess implements Action {
  readonly type = ReservationActionTypes.reservationSuccess;

  constructor(public data: IRoomReservation | IRoomReservation[] | []) {
  }
}

export class ReservationPageSuccess implements Action {
  readonly type = ReservationActionTypes.reservationPageSuccess;

  constructor(public page: Pagination<IReservation>) {
  }
}

export class ReservationFilterPageSuccess implements Action {
  readonly type = ReservationActionTypes.reservationFilterPageSuccess;

  constructor(public filter: Pagination<IReservation>) {
  }
}

export class CustomersSuccess implements Action {
  readonly type = ReservationActionTypes.customersSuccess;

  constructor(public customers: IUser[]) {
  }
}

export class CustomerSuccess implements Action {
  readonly type = ReservationActionTypes.customerSuccess;

  constructor(public customer: ICustomerLastReservation) {
  }
}

export class ReservationTreatmentsSuccess implements Action {
  readonly type = ReservationActionTypes.reservationTreatmentsSuccess;

  constructor(public treatmentDiscount: ITreatmentDiscountDTO[]) {
  }
}

export class ReservationRoomsSuccess implements Action {
  readonly type = ReservationActionTypes.reservationRoomsSuccess;

  constructor(public rooms: IRoom[]) {
  }
}

export class ReservationAdditionalSuccess implements Action {
  readonly type = ReservationActionTypes.reservationAdditionalSuccess;

  constructor(public additional: IAdditional[]) {
  }
}

export class ReservationPaymentsSuccess implements Action {
  readonly type = ReservationActionTypes.reservationPaymentsSuccess;

  constructor(public payments: IPayment[]) {
  }
}

export class ReservationHistorySuccess implements Action {
  readonly type = ReservationActionTypes.reservationHistorySuccess;

  constructor(public history: IReservation[]) {
  }
}

export class CreateReservation implements Action {
  readonly type = ReservationActionTypes.createReservation;

  constructor(public reservation: IReservation, public role: Role) {
  }
}

export class ReservationSaveSuccess extends ResponseSuccess implements Action {
  readonly type = ReservationActionTypes.reservationSaveSuccess;

  constructor(public message: string, public navigate: boolean, public path?: string, public role?: Role,
              public paymentLink?: string, public deleted?: boolean, public id?: string,
              public toastType: ToastType = 'success') {
    super(message, path, undefined, toastType);
  }
}

export class ReservationCustomerSuccess implements Action {
  readonly type = ReservationActionTypes.reservationsCustomerSuccess;

  constructor(public customerReservation: ICustomerReservation) {
  }
}

export class ReservationFailure implements Action {
  readonly type = ReservationActionTypes.reservationFailure;

  constructor(public error: IError) {
  }
}

export class ReservationSelected implements Action {
  readonly type = ReservationActionTypes.reservationSelected;

  constructor(public selected?: IReservation) {
  }
}

export class GetReservation implements Action {
  readonly type = ReservationActionTypes.getReservation;
  readonly editPath?: string;

  constructor(public id: string) {
  }
}

export class GetEditReservation implements Action {
  readonly type = ReservationActionTypes.getEditReservation;
  readonly editPath?: string = 'edit';

  constructor(public id: string) {
  }
}

export class ReservationFindPayments implements Action {
  readonly type = ReservationActionTypes.reservationFindPayments;

  constructor(public id: string) {
  }
}

export class GetReservationHistory implements Action {
  readonly type = ReservationActionTypes.getReservationHistory;

  constructor(public id: string) {
  }
}

export class DeleteReservation implements Action {
  readonly type = ReservationActionTypes.deleteReservation;

  constructor(public id: string, public timestamp: number, public timeZone: string) {
  }
}

export class UpdateReservationById implements Action {
  readonly type = ReservationActionTypes.updateReservationById;

  constructor(public id: string, public reservation: IReservation, public role: Role) {
  }
}

export class ApproveReservation implements Action {
  readonly type = ReservationActionTypes.approveReservation;
  readonly state = 'approve';
  readonly key = 'APPROVE';

  constructor(public id: string, public extras?: any, public isDashboard?: boolean) {
  }
}

export class Start implements Action {
  readonly type = ReservationActionTypes.start;
  readonly state = 'start';
  readonly key = 'START';

  constructor(public id: string, public extras?: any, public isDashboard?: boolean) {
  }
}

export class CompleteReservation implements Action {
  readonly type = ReservationActionTypes.completeReservation;
  readonly state = 'complete';
  readonly key = 'COMPLETE';

  constructor(public id: string, public extras?: any, public isDashboard: boolean = false) {
  }
}

export class CancelReservation implements Action {
  readonly type = ReservationActionTypes.cancelReservation;
  readonly state = 'cancel';
  readonly key = 'CANCEL';

  constructor(public id: string, public extras?: any, public isDashboard?: boolean) {
  }
}

export class CustomerCancelReservation implements Action {
  readonly type = ReservationActionTypes.customerCancelReservation;
  readonly state = 'cancel/customer';
  readonly key = 'CANCEL';

  constructor(public id: string, public extras?: any, public isDashboard?: boolean) {
  }
}

export class PaymentCompleteReservation implements Action {
  readonly type = ReservationActionTypes.paymentCompleteReservation;
  readonly state = 'payment/complete';
  readonly key = 'COMPLETE';

  constructor(public id: string, public extras?: any, public isDashboard?: boolean) {
  }
}

export class UpdateReservationCustomer implements Action {
  readonly type = ReservationActionTypes.updateReservationCustomer;

  constructor(public id: string, public customerId: string) {
  }
}

export class UpdateReservationColor implements Action {
  readonly type = ReservationActionTypes.updateReservationColor;

  constructor(public id: string, public colorId: string) {
  }
}

export class StateSuccess extends ResponseSuccess implements Action {
  readonly type = ReservationActionTypes.stateSuccess;

  constructor(public message: string, public id: string, public paymentLink?: string,
              public isDashboard?: boolean) {
    super(message);
  }
}

export class GetTrackingByReservationId implements Action {
  readonly type = ReservationActionTypes.getTrackingByReservationId;

  constructor(public id: string) {
  }
}

export class ExecuteTrackingByReservationId implements Action {
  readonly type = ReservationActionTypes.executeTrackingByReservationId;

  constructor(public id: string) {
  }
}

export class UpdateTrackingByReservationId implements Action {
  readonly type = ReservationActionTypes.updateTrackingByReservationId;

  constructor(public id: string, public started?: string, public completed?: string) {
  }
}

export class TrackingSuccess implements Action {
  readonly type = ReservationActionTypes.trackingSuccess;

  constructor(public tracking: ITracking) {
  }
}

export class CreateReview implements Action {
  readonly type = ReservationActionTypes.createReview;

  constructor(public review: IReview) {
  }
}

export class GetReview implements Action {
  readonly type = ReservationActionTypes.getReview;

  constructor(public id: string) {
  }
}

export class ReservationReviewSuccess implements Action {
  readonly type = ReservationActionTypes.reservationReviewSuccess;

  constructor(public review?: IReview) {
  }
}

export class GetColorsByTreatmentId implements Action {
  readonly type = ReservationActionTypes.getColorsByTreatmentId;

  constructor(public treatmentId: string) {
  }
}

export class ColorSuccess implements Action {
  readonly type = ReservationActionTypes.colorsCompleteSuccess;

  constructor(public colors: IColor[]) {
  }
}

export class UpdateReservationNote implements Action {
  readonly type = ReservationActionTypes.updateReservationNote;

  constructor(public id: string, public role: Role, public note?: string, public customerNote?: string,
              public paymentLink?: string, public timestamp?: number, public timeZone?: string) {
  }
}

export class UpdateReservationDiscount implements Action {
  readonly type = ReservationActionTypes.updateReservationDiscount;

  constructor(public id: string, public discountId: string) {
  }
}

export class UpdateReservationTimestamp implements Action {
  readonly type = ReservationActionTypes.updateReservationTimestamp;

  constructor(public id: string, public start: string, public role: Role, public timeZone?: string) {
  }
}

export class PaymentOptions implements Action {
  readonly type = ReservationActionTypes.paymentOptions;
}

export class PaymentOptionsSuccess implements Action {
  readonly type = ReservationActionTypes.paymentOptionsSuccess;

  constructor(public paymentOptions?: IPaymentOption[]) {
  }
}

export class Clean implements Action {
  readonly type = ReservationActionTypes.clean;
}

export type All =
  | GetPage
  | GetCustomerReservations
  | GetAllFilterReservations
  | GetAllGroupingByRoom
  | SearchAvailability
  | CustomerSearchReservation
  | GetCustomers
  | GetCustomerInformation
  | GetAllTreatments
  | GetAllRooms
  | FindRooms
  | GetAllAdditionalByGroupId
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
  | GetReservation
  | GetEditReservation
  | ReservationFindPayments
  | GetReservationHistory
  | ReservationSelected
  | DeleteReservation
  | ApproveReservation
  | Start
  | UpdateReservationById
  | CompleteReservation
  | PaymentCompleteReservation
  | CancelReservation
  | CustomerCancelReservation
  | StateSuccess
  | GetTrackingByReservationId
  | ExecuteTrackingByReservationId
  | UpdateTrackingByReservationId
  | TrackingSuccess
  | CreateReview
  | GetReview
  | ReservationReviewSuccess
  | UpdateReservationCustomer
  | GetColorsByTreatmentId
  | ColorSuccess
  | UpdateReservationNote
  | UpdateReservationDiscount
  | UpdateReservationTimestamp
  | PaymentOptions
  | PaymentOptionsSuccess
  | Clean;
