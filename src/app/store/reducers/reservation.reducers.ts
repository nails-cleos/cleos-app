import { All, ReservationActionTypes } from '../reservation.actions';
import { IReservation, IRoomReservation } from '../../interfaces/reservation';
import { IUser } from '../../interfaces/user';
import { IProduct } from '../../interfaces/product';
import { IRoom } from '../../interfaces/room';
import { Pagination } from '../../interfaces/pagination';

export interface State {
  data: IReservation | IRoomReservation[] | IReservation[] | null;
  page: Pagination<IReservation> | null;
  customers: IUser[] | null;
  rooms: IRoom[] | null;
  products: IProduct[] | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IReservation | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  page: null,
  customers: null,
  rooms: null,
  products: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case ReservationActionTypes.getAll: {
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
    case ReservationActionTypes.getAllAssignmentPage:
    case ReservationActionTypes.getAllPage:
    case ReservationActionTypes.getAllMePage: {
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
    case ReservationActionTypes.searchReservation:
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
    case ReservationActionTypes.getCustomers: {
      return {
        ...state,
        customers: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
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
        message: null,
        isLoading: true
      };
    }
    case ReservationActionTypes.getProducts: {
      return {
        ...state,
        products: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case ReservationActionTypes.approve:
    case ReservationActionTypes.edit:
    case ReservationActionTypes.start:
    case ReservationActionTypes.complete:
    case ReservationActionTypes.cancel:
    case ReservationActionTypes.customerCancel:
    case ReservationActionTypes.reservationFind: {
      return {
        ...state,
        data: {} as IReservation,
        page: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case ReservationActionTypes.reservationPageSuccess: {
      return {
        ...state,
        page: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null,
        isLoading: false
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
    case ReservationActionTypes.reservationCustomersSuccess: {
      return {
        ...state,
        customers: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null,
        isLoading: false
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
    case ReservationActionTypes.reservationProductsSuccess: {
      return {
        ...state,
        products: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null,
        isLoading: false
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
    case ReservationActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
