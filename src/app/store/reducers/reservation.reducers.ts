import {
  approveReservation,
  cancelReservation,
  cleanReservation,
  colorsCompleteSuccess,
  completeReservation,
  createReservation,
  createReview,
  customerCancelReservation,
  customerSearchReservation,
  customersSuccess,
  customerSuccess,
  deleteReservation,
  executeTrackingByReservationId,
  getAllAdditionalByGroupId,
  getAllFilterReservations,
  getAllGroupingByRoom,
  getAllRooms,
  getAllTreatments,
  getColorsByTreatmentId,
  getCustomerInformation,
  getCustomerReservations,
  getCustomers,
  getEditReservation,
  getPage,
  getReservation,
  getReservationHistory,
  getReview,
  getTrackingByReservationId,
  getUpcomingReservation,
  paymentCompleteReservation,
  reservationAdditionalSuccess,
  reservationAvailabilitySuccess,
  reservationFailure,
  reservationFilterPageSuccess,
  reservationFindPayments,
  reservationGroupingByRoomSuccess,
  reservationHistorySuccess,
  reservationPageSuccess,
  reservationPaymentsSuccess,
  reservationReviewSuccess,
  reservationRoomsSuccess,
  reservationSaveSuccess,
  reservationsCustomerSuccess,
  reservationSelected,
  reservationTreatmentsSuccess,
  searchAvailability,
  setCurrentCompleteReservation,
  setCurrentReservationId,
  setDetailReservationParams,
  setMeReservationParams,
  setReservationParams,
  startReservation,
  stateSuccess,
  trackingSuccess,
  updateReservationById,
  updateReservationColor,
  updateReservationCustomer,
  updateReservationDiscount,
  updateReservationNote,
  updateReservationTimestamp,
  updateTrackingByReservationId,
} from '../reservation.actions';
import {
  IAvailableDTO,
  ICustomerLastReservation,
  ICustomerReservation,
  IReservationAll,
  IRoomReservation,
  ITracking,
  IUpcomingAll,
} from '../../interfaces/reservation';
import { IUserAll } from '../../interfaces/user';
import { ITreatmentDiscountDTO } from '../../interfaces/treatment';
import { IRoomAll } from '../../interfaces/room';
import { Pagination } from '../../interfaces/pagination';
import { IPaymentAll } from '../../interfaces/payment';
import { IAdditionalAll } from '../../interfaces/additional';
import { IOffice } from '../../interfaces/office';
import { IColorAll } from '../../interfaces/color';
import { IReview } from '../../interfaces/review';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';
import { clearGlobalError, clearGlobalResponse } from '../global.actions';
import {
  CurrentCompleteReservationParams,
  DetailReservationParams,
  MeReservationParams,
  ReservationParams,
} from '../reservation.models';

export const RESERVATION_FEATURE_KEY = 'reservation';

export interface ReservationState {
  response?: IResponseSuccess;
  groupedRooms?: IRoomReservation[];
  availability?: IAvailableDTO[];
  filter?: Pagination<IReservationAll>;
  page?: Pagination<IReservationAll>;
  customerReservation?: ICustomerReservation;
  customers?: IUserAll[];
  offices?: IOffice[];
  customer?: ICustomerLastReservation;
  rooms?: IRoomAll[];
  additional?: IAdditionalAll[];
  treatmentDiscount?: ITreatmentDiscountDTO;
  tracking?: ITracking;
  payments?: IPaymentAll[];
  history?: IReservationAll[];
  colors?: IColorAll[];
  review?: IReview;
  error?: IError;
  subErrors?: IError[];
  selected?: IUpcomingAll;
  meReservationParams?: MeReservationParams;
  currentReservationId?: string;
  currentCompleteReservation?: CurrentCompleteReservationParams;
  detailReservationParams?: DetailReservationParams;
  reservationParams?: ReservationParams;
  isLoading: boolean;
}

export const initialState: ReservationState = {
  response: undefined,
  groupedRooms: undefined,
  availability: undefined,
  filter: undefined,
  page: undefined,
  customerReservation: undefined,
  customers: undefined,
  offices: undefined,
  customer: undefined,
  rooms: undefined,
  additional: undefined,
  treatmentDiscount: undefined,
  tracking: undefined,
  payments: undefined,
  history: undefined,
  colors: undefined,
  review: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  meReservationParams: undefined,
  currentReservationId: undefined,
  currentCompleteReservation: undefined,
  detailReservationParams: undefined,
  reservationParams: undefined,
  isLoading: false,
};

export const reservationReducer = createReducer(
  initialState,
  on(getCustomerReservations, (state) => ({
    ...state,
    customerReservation: {
      reservations: { content: [{}, {}, {}], totalElements: 3 },
      upcoming: [{}],
    } as ICustomerReservation,
    error: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllFilterReservations, (state) => ({
    ...state,
    filter: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IReservationAll>,
    error: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getPage, (state) => ({
    ...state,
    page: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IReservationAll>,
    error: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllGroupingByRoom, (state) => ({
    ...state,
    groupedRooms: undefined,
    error: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(getUpcomingReservation, (state) => ({
    ...state,
    error: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(customerSearchReservation, searchAvailability, (state) => ({
    ...state,
    availability: undefined,
    error: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(getCustomers, (state) => ({
    ...state,
    customers: undefined,
    error: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getCustomerInformation, (state) => ({
    ...state,
    customer: undefined,
    error: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllRooms, (state) => ({
    ...state,
    rooms: undefined,
    isLoading: true,
    error: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllAdditionalByGroupId, (state) => ({
    ...state,
    additional: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(getAllTreatments, (state) => ({
    ...state,
    treatmentDiscount: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(updateReservationNote, updateReservationDiscount, updateReservationTimestamp, updateReservationById, (state) => ({
    ...state,
    page: undefined,
    filter: undefined,
    error: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(reservationFindPayments, (state) => ({
    ...state,
    payments: [{}, {}, {}] as IPaymentAll[],
    page: undefined,
    filter: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(getReservationHistory, (state) => ({
    ...state,
    history: [{}, {}, {}] as IUpcomingAll[],
    page: undefined,
    filter: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(approveReservation,
    startReservation,
    completeReservation,
    paymentCompleteReservation,
    cancelReservation,
    customerCancelReservation, (state) => ({
      ...state,
      page: undefined,
      filter: undefined,
      error: undefined,
      subErrors: undefined,
      response: undefined,
      isLoading: true,
    })),
  on(getEditReservation,
    updateReservationCustomer,
    updateReservationColor, (state) => ({
      ...state,
      page: undefined,
      filter: undefined,
      error: undefined,
      subErrors: undefined,
      selected: undefined,
      response: undefined,
    })),
  on(getReservation, (state) => ({
    ...state,
    page: undefined,
    filter: undefined,
    error: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(reservationPageSuccess, (state, { page }) => ({
    ...state,
    page,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(reservationFilterPageSuccess, (state, { filter }) => ({
    ...state,
    filter,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(reservationsCustomerSuccess, (state, { customerReservation }) => ({
    ...state,
    customerReservation,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(reservationGroupingByRoomSuccess, (state, { groupedRooms }) => ({
    ...state,
    groupedRooms,
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: false,
  })),
  on(reservationAvailabilitySuccess, (state, { availability }) => ({
    ...state,
    availability,
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: false,
  })),
  on(customersSuccess, (state, { customers }) => ({
    ...state,
    customers,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(customerSuccess, (state, { customer }) => ({
    ...state,
    customer,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(reservationRoomsSuccess, (state, { rooms }) => ({
    ...state,
    rooms,
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: false,
  })),
  on(reservationTreatmentsSuccess, (state, { treatmentDiscount }) => ({
    ...state,
    treatmentDiscount,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(reservationAdditionalSuccess, (state, { additional }) => ({
    ...state,
    additional,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(stateSuccess, reservationSaveSuccess, (state, action) => ({
    ...state,
    response: action,
    error: undefined,
    subErrors: undefined,
    selected: action.state ? { ...state.selected, state: action.state } as IUpcomingAll : state.selected,
    isLoading: false,
  })),
  on(reservationSelected, (state, { selected }) => ({
    ...state,
    selected,
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: false,
  })),
  on(reservationFailure, (state, { error }) => ({
    ...state,
    error: error,
    subErrors: error?.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(createReservation, deleteReservation, (state) => ({
    ...state,
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(updateTrackingByReservationId, executeTrackingByReservationId, (state) => ({
    ...state,
    tracking: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(getTrackingByReservationId, (state) => ({
    ...state,
    tracking: undefined,
    error: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(trackingSuccess, (state, { tracking }) => ({
    ...state,
    tracking,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(reservationPaymentsSuccess, (state, { payments }) => ({
    ...state,
    payments,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(reservationHistorySuccess, (state, { history }) => ({
    ...state,
    history,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(createReview, (state) => ({
    ...state,
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: false,
  })),
  on(getReview, (state) => ({
    ...state,
    review: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: false,
  })),
  on(reservationReviewSuccess, (state, { review }) => ({
    ...state,
    review,
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: false,
  })),
  on(getColorsByTreatmentId, (state) => ({
    ...state,
    colors: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(colorsCompleteSuccess, (state, { colors }) => ({
    ...state,
    colors,
    subErrors: undefined,
    response: undefined,
  })),
  on(setMeReservationParams, (state, { treatmentId, roomId, professionalId, date, discountId }) => ({
    ...state,
    meReservationParams: { treatmentId, roomId, professionalId, date, discountId },
  })),
  on(setCurrentReservationId, (state, { reservationId }) => ({
    ...state,
    currentReservationId: reservationId,
  })),
  on(setCurrentCompleteReservation, (state, { reservationId, roomId, customerId, isDashboard }) => ({
    ...state,
    currentCompleteReservation: { reservationId, roomId, customerId, isDashboard },
  })),
  on(setDetailReservationParams, (state, { step }) => ({
    ...state,
    detailReservationParams: { step },
  })),
  on(setReservationParams, (state, {
    isDashboard,
    skip,
    customerId,
    roomId,
    treatmentId,
    groupId,
    professionalId,
    additionalIds,
    date,
    discountId,
  }) => ({
    ...state,
    reservationParams: {
      isDashboard,
      skip,
      customerId,
      roomId,
      treatmentId,
      groupId,
      professionalId,
      additionalIds,
      date,
      discountId,
    },
  })),
  on(cleanReservation, (state) => ({
    ...initialState,
    response: state.response,
  })),

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
