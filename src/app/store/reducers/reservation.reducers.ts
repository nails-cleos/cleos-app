import { All, ReservationActionTypes } from '../reservation.actions';
import {
  IAvailableDTO,
  ICustomerLastReservation,
  ICustomerReservation,
  IReservation,
  IRoomReservation,
  ITracking
} from '../../interfaces/reservation';
import { IUser } from '../../interfaces/user';
import { ITreatmentDiscountDTO } from '../../interfaces/treatment';
import { IRoom } from '../../interfaces/room';
import { Pagination } from '../../interfaces/pagination';
import { IPayment } from '../../interfaces/payment';
import { IAdditional } from '../../interfaces/additional';
import { IBank } from '../../interfaces/bank';
import { IOffice } from '../../interfaces/office';
import { IColorAll } from '../../interfaces/color';

export interface State {
  data: IReservation | IRoomReservation[] | IReservation[] | ICustomerReservation | IAvailableDTO | null;
  filter: Pagination<IReservation> | null;
  page: Pagination<IReservation> | null;
  customerReservation: ICustomerReservation | null;
  customers: IUser[] | null;
  offices: IOffice[] | null;
  customer: ICustomerLastReservation | null;
  rooms: IRoom[] | null;
  additional: IAdditional[] | null;
  treatmentDiscount: ITreatmentDiscountDTO[] | null;
  tracking: ITracking[] | ITracking | null;
  payments: IPayment[] | null;
  history: IReservation[] | null;
  banks: IBank[] | null;
  colors: IColorAll[] | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IReservation | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  filter: null,
  page: null,
  customerReservation: null,
  customers: null,
  offices: null,
  customer: null,
  rooms: null,
  additional: null,
  treatmentDiscount: null,
  tracking: null,
  payments: null,
  history: null,
  banks: null,
  colors: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case ReservationActionTypes.getCustomerReservations: {
      return {
        ...state,
        // @ts-ignore
        customerReservation: { reservations: { content: [{}, {}, {}], totalElements: 3 }, upcoming: [{}] },
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case ReservationActionTypes.getAllFilterPage: {
      return {
        ...state,
        // @ts-ignore
        filter: { content: [{}, {}, {}], totalElements: 3 },
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case ReservationActionTypes.getAllPage: {
      return {
        ...state,
        // @ts-ignore
        page: { content: [{}, {}, {}], totalElements: 3 },
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case ReservationActionTypes.getAllGroupingByRoom: {
      return {
        ...state,
        data: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case ReservationActionTypes.getUpcomingReservation: {
      return {
        ...state,
        data: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case ReservationActionTypes.customerSearchReservation:
    case ReservationActionTypes.searchReservation: {
      return {
        ...state,
        data: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case ReservationActionTypes.getCustomers: {
      return {
        ...state,
        customers: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case ReservationActionTypes.getCustomerInfo: {
      return {
        ...state,
        customer: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case ReservationActionTypes.getRooms: {
      return {
        ...state,
        rooms: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case ReservationActionTypes.findRooms: {
      return {
        ...state,
        rooms: null,
        isLoading: true,
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case ReservationActionTypes.getAdditional: {
      return {
        ...state,
        additional: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.getServices: {
      return {
        ...state,
        treatmentDiscount: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.edit: {
      return {
        ...state,
        data: {} as IReservation,
        page: null,
        filter: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case ReservationActionTypes.reservationFindPayments: {
      return {
        ...state,
        payments: [{}, {}, {}],
        page: null,
        filter: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.reservationFindHistory: {
      return {
        ...state,
        history: [{}, {}, {}],
        page: null,
        filter: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.approve:
    case ReservationActionTypes.start:
    case ReservationActionTypes.complete:
    case ReservationActionTypes.paymentComplete:
    case ReservationActionTypes.cancel:
    case ReservationActionTypes.customerCancel:
    case ReservationActionTypes.reservationFind: {
      return {
        ...state,
        data: {} as IReservation,
        page: null,
        filter: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case ReservationActionTypes.reservationPageSuccess: {
      return {
        ...state,
        page: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.reservationFilterPageSuccess: {
      return {
        ...state,
        filter: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.reservationsCustomerSuccess: {
      return {
        ...state,
        customerReservation: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.reservationSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case ReservationActionTypes.customersSuccess: {
      return {
        ...state,
        customers: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.customerSuccess: {
      return {
        ...state,
        customer: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.reservationRoomsSuccess: {
      return {
        ...state,
        rooms: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case ReservationActionTypes.reservationTreatmentsSuccess: {
      return {
        ...state,
        treatmentDiscount: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.reservationAdditionalSuccess: {
      return {
        ...state,
        additional: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.stateSuccess:
    case ReservationActionTypes.reservationCompleteSuccess:
    case ReservationActionTypes.reservationSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        errorMessage: null,
        error: null,
        subErrors: null,
        isLoading: false
      };
    }
    case ReservationActionTypes.reservationSelected: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case ReservationActionTypes.reservationFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case ReservationActionTypes.reservationSave:
    case ReservationActionTypes.reservationDelete: {
      return {
        ...state,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case ReservationActionTypes.executeTracking: {
      return {
        ...state,
        tracking: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.findTracking: {
      return {
        ...state,
        tracking: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case ReservationActionTypes.trackingSuccess: {
      return {
        ...state,
        tracking: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.reservationPaymentsSuccess: {
      return {
        ...state,
        payments: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.reservationHistorySuccess: {
      return {
        ...state,
        history: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.reservationReview: {
      return {
        ...state,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case ReservationActionTypes.getAllColorsByTreatmentId: {
      return {
        ...state,
        colors: null,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.colorsCompleteSuccess: {
      return {
        ...state,
        colors: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
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
