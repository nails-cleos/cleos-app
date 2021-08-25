import { All, ReservationActionTypes } from '../reservation.actions';
import {
  IAvailableDTO,
  ICustomerReservation,
  IReservation,
  IRoomReservation,
  ITracking
} from '../../interfaces/reservation';
import { IUser } from '../../interfaces/user';
import { IProductDiscountDTO } from '../../interfaces/product';
import { IRoom } from '../../interfaces/room';
import { Pagination } from '../../interfaces/pagination';
import { IPayment } from '../../interfaces/payment';

export interface State {
  data: IReservation | IRoomReservation[] | IReservation[] | ICustomerReservation | IAvailableDTO | null;
  dash: IReservation[] | null;
  filter: Pagination<IReservation> | null;
  page: Pagination<IReservation> | null;
  customerReservation: ICustomerReservation | null;
  customers: IUser[] | null;
  rooms: IRoom[] | null;
  productDiscount: IProductDiscountDTO[] | null;
  tracking: ITracking[] | ITracking | null;
  payments: IPayment[] | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IReservation | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  dash: null,
  page: null,
  filter: null,
  customerReservation: null,
  customers: null,
  rooms: null,
  productDiscount: null,
  tracking: null,
  payments: null,
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
        customerReservation: {reservations: {content: [{}, {}, {}], totalElements: 3}, upcoming: {}},
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case ReservationActionTypes.getAll: {
      return {
        ...state,
        dash: null,
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
        filter: {content: [{}, {}, {}], totalElements: 3},
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
        page: {content: [{}, {}, {}], totalElements: 3},
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
    case ReservationActionTypes.getProducts: {
      return {
        ...state,
        productDiscount: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
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
        selected: null,
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
    case ReservationActionTypes.reservationDashSuccess: {
      return {
        ...state,
        dash: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
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
    case ReservationActionTypes.reservationRoomsSuccess: {
      return {
        ...state,
        rooms: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.reservationProductsSuccess: {
      return {
        ...state,
        productDiscount: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case ReservationActionTypes.stateSuccess:
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
    case ReservationActionTypes.getTracking: {
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
    case ReservationActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
