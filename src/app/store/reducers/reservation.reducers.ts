import { All, ReservationActionTypes } from '../reservation.actions';
import {
  IAvailableDTO,
  ICustomerLastReservation,
  ICustomerReservation,
  IReservation,
  IRoomReservation,
  ITracking,
} from '../../interfaces/reservation';
import { IUser } from '../../interfaces/user';
import { ITreatmentDiscountDTO } from '../../interfaces/treatment';
import { IRoom } from '../../interfaces/room';
import { Pagination } from '../../interfaces/pagination';
import { IPayment, IPaymentOption } from '../../interfaces/payment';
import { IAdditional } from '../../interfaces/additional';
import { IOffice } from '../../interfaces/office';
import { IColor } from '../../interfaces/color';
import { IReview } from '../../interfaces/review';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: IReservation | IRoomReservation[] | IReservation[] | ICustomerReservation | IAvailableDTO;
  filter?: Pagination<IReservation>;
  page?: Pagination<IReservation>;
  customerReservation?: ICustomerReservation;
  customers?: IUser[];
  offices?: IOffice[];
  customer?: ICustomerLastReservation;
  rooms?: IRoom[];
  additional?: IAdditional[];
  treatmentDiscount?: ITreatmentDiscountDTO[];
  tracking?: ITracking[] | ITracking;
  payments?: IPayment[];
  history?: IReservation[];
  colors?: IColor[];
  paymentOptions?: IPaymentOption[];
  review?: IReview;
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IReservation;
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
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
  paymentOptions: undefined,
  review: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case ReservationActionTypes.getCustomerReservations: {
      return {
        ...state,
        customerReservation: {
          reservations: { content: [{}, {}, {}], totalElements: 3 },
          upcoming: [{}],
        } as ICustomerReservation,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.getAllFilterReservations: {
      return {
        ...state,
        filter: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IReservation>,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.getPage: {
      return {
        ...state,
        page: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IReservation>,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.getAllGroupingByRoom: {
      return {
        ...state,
        data: undefined,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
        isLoading: true,
      };
    }
    case ReservationActionTypes.getUpcomingReservation: {
      return {
        ...state,
        data: undefined,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.customerSearchReservation:
    case ReservationActionTypes.searchAvailability: {
      return {
        ...state,
        data: undefined,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
        isLoading: true,
      };
    }
    case ReservationActionTypes.getCustomers: {
      return {
        ...state,
        customers: undefined,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.getCustomerInformation: {
      return {
        ...state,
        customer: undefined,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.getAllRooms:
    case ReservationActionTypes.findRooms: {
      return {
        ...state,
        rooms: undefined,
        isLoading: true,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.getAllAdditionalByGroupId: {
      return {
        ...state,
        additional: undefined,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.getAllTreatments: {
      return {
        ...state,
        treatmentDiscount: undefined,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.updateReservationNote:
    case ReservationActionTypes.updateReservationDiscount:
    case ReservationActionTypes.updateReservationTimestamp:
    case ReservationActionTypes.updateReservationById: {
      return {
        ...state,
        data: {} as IReservation,
        page: undefined,
        filter: undefined,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
        isLoading: true,
      };
    }
    case ReservationActionTypes.reservationFindPayments: {
      return {
        ...state,
        payments: [{}, {}, {}],
        page: undefined,
        filter: undefined,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.getReservationHistory: {
      return {
        ...state,
        history: [{}, {}, {}],
        page: undefined,
        filter: undefined,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.approveReservation:
    case ReservationActionTypes.start:
    case ReservationActionTypes.completeReservation:
    case ReservationActionTypes.paymentCompleteReservation:
    case ReservationActionTypes.cancelReservation:
    case ReservationActionTypes.customerCancelReservation:
    case ReservationActionTypes.getEditReservation:
    case ReservationActionTypes.getReservation: {
      return {
        ...state,
        data: {} as IReservation,
        page: undefined,
        filter: undefined,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.reservationPageSuccess: {
      return {
        ...state,
        page: action.page,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.reservationFilterPageSuccess: {
      return {
        ...state,
        filter: action.filter,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.reservationsCustomerSuccess: {
      return {
        ...state,
        customerReservation: action.customerReservation,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.reservationSuccess: {
      return {
        ...state,
        data: action.data,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
        isLoading: false,
      };
    }
    case ReservationActionTypes.customersSuccess: {
      return {
        ...state,
        customers: action.customers,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.customerSuccess: {
      return {
        ...state,
        customer: action.customer,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.reservationRoomsSuccess: {
      return {
        ...state,
        rooms: action.rooms,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
        isLoading: false,
      };
    }
    case ReservationActionTypes.reservationTreatmentsSuccess: {
      return {
        ...state,
        treatmentDiscount: action.treatmentDiscount,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.reservationAdditionalSuccess: {
      return {
        ...state,
        additional: action.additional,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.stateSuccess:
    case ReservationActionTypes.reservationSaveSuccess: {
      return {
        ...state,
        response: action,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        isLoading: false,
      };
    }
    case ReservationActionTypes.reservationSelected: {
      return {
        ...state,
        selected: action.selected,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
        isLoading: false,
      };
    }
    case ReservationActionTypes.reservationFailure: {
      return {
        ...state,
        errorMessage: action.error.message,
        error: action.error,
        subErrors: action.error.subErrors,
        response: undefined,
        isLoading: false,
      };
    }
    case ReservationActionTypes.createReservation:
    case ReservationActionTypes.deleteReservation: {
      return {
        ...state,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
        isLoading: true,
      };
    }
    case ReservationActionTypes.updateTrackingByReservationId:
    case ReservationActionTypes.executeTrackingByReservationId: {
      return {
        ...state,
        tracking: undefined,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.getTrackingByReservationId: {
      return {
        ...state,
        tracking: undefined,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.trackingSuccess: {
      return {
        ...state,
        tracking: action.tracking,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.reservationPaymentsSuccess: {
      return {
        ...state,
        payments: action.payments,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.reservationHistorySuccess: {
      return {
        ...state,
        history: action.history,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.createReview: {
      return {
        ...state,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
        isLoading: false,
      };
    }
    case ReservationActionTypes.getReview: {
      return {
        ...state,
        review: undefined,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
        isLoading: false,
      };
    }
    case ReservationActionTypes.reservationReviewSuccess: {
      return {
        ...state,
        review: action.review,
        errorMessage: undefined,
        error: undefined,
        subErrors: undefined,
        response: undefined,
        isLoading: false,
      };
    }
    case ReservationActionTypes.getColorsByTreatmentId: {
      return {
        ...state,
        colors: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.colorsCompleteSuccess: {
      return {
        ...state,
        colors: action.colors,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.paymentOptions: {
      return {
        ...state,
        paymentOptions: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.paymentOptionsSuccess: {
      return {
        ...state,
        paymentOptions: action.paymentOptions,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case ReservationActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
