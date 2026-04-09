import { createAction, props } from '@ngrx/store';
import { SortDirection } from '@angular/material/sort';
import { IError, PageRequest } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';
import {
  IAvailableDTO,
  ICustomerLastReservation,
  ICustomerReservation,
  IReservation,
  IReservationAll,
  IRoomReservation,
  ITracking,
  IUpcomingAll,
  States,
} from '../interfaces/reservation';
import { IUserAll } from '../interfaces/user';
import { ITreatmentDiscountDTO } from '../interfaces/treatment';
import { IRoomAll } from '../interfaces/room';
import { IAdditionalAll } from '../interfaces/additional';
import { IPaymentAll } from '../interfaces/payment';
import { Role } from '../interfaces/token';
import { IReview } from '../interfaces/review';
import { IColorAll } from '../interfaces/color';
import { ToastType } from '../shared/toast/toast.model';
import {
  CurrentCompleteReservationParams,
  DetailReservationParams,
  MeReservationParams,
  ReservationParams,
} from './reservation.models';

enum ReservationActionTypes {
  getPage = '[Reservation] Find paged',
  getCustomerReservations = '[Reservation] Get customer reservations',
  getAllFilterReservations = '[Reservation] Get all filter reservations',
  getAllGroupingByRoom = '[Reservation] Get all grouping by room',
  getCustomers = '[Reservation] Get customers',
  getCustomerInformation = '[Reservation] Get customer info',
  getAllTreatments = '[Reservation] Get all treatments',
  getAllRooms = '[Reservation] Get all rooms',
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
  startReservation = '[Reservation] Start',
  completeReservation = '[Reservation] Complete reservation',
  paymentCompleteReservation = '[Reservation] Payment complete reservation',
  cancelReservation = '[Reservation] Cancel reservation',
  customerCancelReservation = '[Reservation] Customer cancel reservation',
  updateReservationCustomer = '[Reservation] Update customer by reservation id',
  updateReservationColor = '[Reservation] Update color by reservation id',
  stateSuccess = '[Reservation] State success',
  reservationGroupingByRoomSuccess = '[Reservation] Grouping by room success',
  reservationAvailabilitySuccess = '[Reservation] Availability success',
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
  setMeReservationParams = '[Reservation] Set me reservation params',
  setCurrentReservationId = '[Reservation] Set current reservation id',
  setCurrentCompleteReservation = '[Reservation] Set current complete reservation',
  setDetailReservationParams = '[Reservation] Set detail reservation params',
  setReservationParams = '[Reservation] Set reservation params',
  clean = '[Reservation] Clean'
}

export const getPage = createAction(
  ReservationActionTypes.getPage,
  props<{
    page: number;
    sort: string;
    direction: SortDirection;
    size: number;
    roomId?: string;
    all?: boolean;
    professionalId?: string;
  }>(),
);

export const getCustomerReservations = createAction(
  ReservationActionTypes.getCustomerReservations,
  props<PageRequest>(),
);

export const getAllFilterReservations = createAction(
  ReservationActionTypes.getAllFilterReservations,
  props<{
    page: number;
    sort: string;
    direction: SortDirection;
    size: number;
    userId?: string;
    states?: string[];
  }>(),
);

export const getAllGroupingByRoom = createAction(
  ReservationActionTypes.getAllGroupingByRoom,
  props<{ days: number; date: Date; roomId: string; professionalId?: string }>(),
);

export const searchAvailability = createAction(
  ReservationActionTypes.searchAvailability,
  props<{ days: number; dates: Date[]; roomId: string; professionalId?: string }>(),
);

export const customerSearchReservation = createAction(
  ReservationActionTypes.customerSearchReservation,
  props<{ roomId: string; treatmentId: string; date: Date; professionalId: string; additionalIds?: string[] }>(),
);

export const getCustomers = createAction(ReservationActionTypes.getCustomers);

export const getCustomerInformation = createAction(
  ReservationActionTypes.getCustomerInformation,
  props<{ id: string }>(),
);

export const getAllTreatments = createAction(
  ReservationActionTypes.getAllTreatments,
  props<{ roomId: string; customerId?: string }>(),
);

export const getAllRooms = createAction(
  ReservationActionTypes.getAllRooms,
  props<{ customerId?: string }>(),
);

export const getAllAdditionalByGroupId = createAction(
  ReservationActionTypes.getAllAdditionalByGroupId,
  props<{ roomId: string; groupId: string }>(),
);

export const getUpcomingReservation = createAction(ReservationActionTypes.getUpcomingReservation);

export const reservationGroupingByRoomSuccess = createAction(
  ReservationActionTypes.reservationGroupingByRoomSuccess,
  props<{ groupedRooms: IRoomReservation[] }>(),
);

export const reservationAvailabilitySuccess = createAction(
  ReservationActionTypes.reservationAvailabilitySuccess,
  props<{ availability: IAvailableDTO[] }>(),
);

export const reservationPageSuccess = createAction(
  ReservationActionTypes.reservationPageSuccess,
  props<{ page: Pagination<IReservationAll> }>(),
);

export const reservationFilterPageSuccess = createAction(
  ReservationActionTypes.reservationFilterPageSuccess,
  props<{ filter: Pagination<IReservationAll> }>(),
);

export const customersSuccess = createAction(
  ReservationActionTypes.customersSuccess,
  props<{ customers: IUserAll[] }>(),
);

export const customerSuccess = createAction(
  ReservationActionTypes.customerSuccess,
  props<{ customer: ICustomerLastReservation }>(),
);

export const reservationTreatmentsSuccess = createAction(
  ReservationActionTypes.reservationTreatmentsSuccess,
  props<{ treatmentDiscount: ITreatmentDiscountDTO }>(),
);

export const reservationRoomsSuccess = createAction(
  ReservationActionTypes.reservationRoomsSuccess,
  props<{ rooms: IRoomAll[] }>(),
);

export const reservationAdditionalSuccess = createAction(
  ReservationActionTypes.reservationAdditionalSuccess,
  props<{ additional: IAdditionalAll[] }>(),
);

export const reservationPaymentsSuccess = createAction(
  ReservationActionTypes.reservationPaymentsSuccess,
  props<{ payments: IPaymentAll[] }>(),
);

export const reservationHistorySuccess = createAction(
  ReservationActionTypes.reservationHistorySuccess,
  props<{ history: IReservationAll[] }>(),
);

export const createReservation = createAction(
  ReservationActionTypes.createReservation,
  props<{ reservation: IReservation; role: Role }>(),
);

export const reservationSaveSuccess = createAction(
  ReservationActionTypes.reservationSaveSuccess,
  props<{
    message: string;
    navigate: boolean;
    path?: string;
    role?: Role;
    paymentLink?: string;
    deleted?: boolean;
    id?: string;
    toastType?: ToastType;
    state?: States;
  }>(),
);

export const reservationsCustomerSuccess = createAction(
  ReservationActionTypes.reservationsCustomerSuccess,
  props<{ customerReservation: ICustomerReservation }>(),
);

export const reservationFailure = createAction(
  ReservationActionTypes.reservationFailure,
  props<{ error: IError }>(),
);

export const reservationSelected = createAction(
  ReservationActionTypes.reservationSelected,
  props<{ selected?: IUpcomingAll }>(),
);

export const getReservation = createAction(
  ReservationActionTypes.getReservation,
  props<{ id: string; editPath?: string }>(),
);

export const getEditReservation = createAction(
  ReservationActionTypes.getEditReservation,
  props<{ id: string; editPath?: string }>(),
);

export const reservationFindPayments = createAction(
  ReservationActionTypes.reservationFindPayments,
  props<{ id: string }>(),
);

export const getReservationHistory = createAction(
  ReservationActionTypes.getReservationHistory,
  props<{ id: string }>(),
);

export const deleteReservation = createAction(
  ReservationActionTypes.deleteReservation,
  props<{ id: string; timestamp: number; timeZone: string }>(),
);

export const updateReservationById = createAction(
  ReservationActionTypes.updateReservationById,
  props<{ id: string; reservation: IReservation; role: Role }>(),
);

export const approveReservation = createAction(
  ReservationActionTypes.approveReservation,
  (id: string, extras?: any, isDashboard?: boolean) => ({
    id,
    extras,
    isDashboard,
    event: 'approve' as const,
    key: 'APPROVE' as const,
    state: States.approved,
  }),
);

export const startReservation = createAction(
  ReservationActionTypes.startReservation,
  (id: string, extras?: any, isDashboard?: boolean) => ({
    id,
    extras,
    isDashboard,
    event: 'start' as const,
    key: 'START' as const,
    state: States.started,
  }),
);

export const completeReservation = createAction(
  ReservationActionTypes.completeReservation,
  (id: string, extras?: any, isDashboard?: boolean) => ({
    id,
    extras,
    isDashboard,
    event: 'complete' as const,
    key: 'COMPLETE' as const,
    state: States.completed,
  }),
);

export const cancelReservation = createAction(
  ReservationActionTypes.cancelReservation,
  (id: string, extras?: any, isDashboard?: boolean) => ({
    id,
    extras,
    isDashboard,
    event: 'cancel' as const,
    key: 'CANCEL' as const,
    state: States.cancelled,
  }),
);

export const customerCancelReservation = createAction(
  ReservationActionTypes.customerCancelReservation,
  (id: string, extras?: any, isDashboard?: boolean) => ({
    id,
    extras,
    isDashboard,
    event: 'cancel/customer' as const,
    key: 'CANCEL' as const,
    state: States.cancelled,
  }),
);

export const paymentCompleteReservation = createAction(
  ReservationActionTypes.paymentCompleteReservation,
  (id: string, extras?: any, isDashboard?: boolean) => ({
    id,
    extras,
    isDashboard,
    event: 'payment/complete' as const,
    key: 'COMPLETE' as const,
    state: States.completed,
  }),
);

export const updateReservationCustomer = createAction(
  ReservationActionTypes.updateReservationCustomer,
  props<{ id: string; customerId: string }>(),
);

export const updateReservationColor = createAction(
  ReservationActionTypes.updateReservationColor,
  props<{ id: string; colorId: string }>(),
);

export const stateSuccess = createAction(
  ReservationActionTypes.stateSuccess,
  props<{ message: string; id: string; paymentLink?: string; isDashboard?: boolean; state?: States }>(),
);

export const getTrackingByReservationId = createAction(
  ReservationActionTypes.getTrackingByReservationId,
  props<{ id: string }>(),
);

export const executeTrackingByReservationId = createAction(
  ReservationActionTypes.executeTrackingByReservationId,
  props<{ id: string }>(),
);

export const updateTrackingByReservationId = createAction(
  ReservationActionTypes.updateTrackingByReservationId,
  props<{ id: string; started?: string; completed?: string }>(),
);

export const trackingSuccess = createAction(
  ReservationActionTypes.trackingSuccess,
  props<{ tracking: ITracking }>(),
);

export const createReview = createAction(
  ReservationActionTypes.createReview,
  props<{ review: IReview }>(),
);

export const getReview = createAction(
  ReservationActionTypes.getReview,
  props<{ id: string }>(),
);

export const reservationReviewSuccess = createAction(
  ReservationActionTypes.reservationReviewSuccess,
  props<{ review?: IReview }>(),
);

export const getColorsByTreatmentId = createAction(
  ReservationActionTypes.getColorsByTreatmentId,
  props<{ treatmentId: string }>(),
);

export const colorsCompleteSuccess = createAction(
  ReservationActionTypes.colorsCompleteSuccess,
  props<{ colors: IColorAll[] }>(),
);

export const updateReservationNote = createAction(
  ReservationActionTypes.updateReservationNote,
  props<{
    id: string;
    role: Role;
    note?: string;
    customerNote?: string;
    paymentLink?: string;
    timestamp?: number;
    timeZone?: string;
  }>(),
);

export const updateReservationDiscount = createAction(
  ReservationActionTypes.updateReservationDiscount,
  props<{ id: string; discountId: string }>(),
);

export const updateReservationTimestamp = createAction(
  ReservationActionTypes.updateReservationTimestamp,
  props<{ id: string; start: string; role: Role; timeZone?: string }>(),
);

export const setMeReservationParams = createAction(
  ReservationActionTypes.setMeReservationParams,
  props<MeReservationParams>(),
);

export const setCurrentReservationId = createAction(
  ReservationActionTypes.setCurrentReservationId,
  props<{ reservationId: string; }>(),
);

export const setCurrentCompleteReservation = createAction(
  ReservationActionTypes.setCurrentCompleteReservation,
  props<CurrentCompleteReservationParams>(),
);

export const setDetailReservationParams = createAction(
  ReservationActionTypes.setDetailReservationParams,
  props<DetailReservationParams>(),
);

export const setReservationParams = createAction(
  ReservationActionTypes.setReservationParams,
  props<ReservationParams>(),
);

export const cleanReservation = createAction(ReservationActionTypes.clean);
