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

export function reducer(state = initialState, action: All): State {
  switch (action.type) {
    case ReservationActionTypes.GET_ALL: {
      return {
        ...state,
        data: null,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case ReservationActionTypes.GET_ALL_ASSIGNMENT_PAGE:
    case ReservationActionTypes.GET_ALL_PAGE: {
      return {
        ...state,
        // @ts-ignore
        page: {content: [{}, {}, {}], totalElements: 3},
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case ReservationActionTypes.SEARCH_RESERVATION:
    case ReservationActionTypes.GET_ALL_GROUPING_BY_ROOM: {
      return {
        ...state,
        data: null,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case ReservationActionTypes.GET_CUSTOMERS: {
      return {
        ...state,
        customers: null,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case ReservationActionTypes.GET_ROOMS: {
      return {
        ...state,
        rooms: null,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case ReservationActionTypes.GET_PRODUCTS: {
      return {
        ...state,
        products: null,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case ReservationActionTypes.APPROVE:
    case ReservationActionTypes.EDIT:
    case ReservationActionTypes.START:
    case ReservationActionTypes.COMPLETE:
    case ReservationActionTypes.CANCEL:
    case ReservationActionTypes.RESERVATION_FIND: {
      return {
        ...state,
        data: {} as IReservation,
        page: null,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case ReservationActionTypes.RESERVATION_PAGE_SUCCESS: {
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
    case ReservationActionTypes.RESERVATION_SUCCESS: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case ReservationActionTypes.RESERVATION_CUSTOMERS_SUCCESS: {
      return {
        ...state,
        customers: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case ReservationActionTypes.RESERVATION_ROOMS_SUCCESS: {
      return {
        ...state,
        rooms: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case ReservationActionTypes.RESERVATION_PRODUCTS_SUCCESS: {
      return {
        ...state,
        products: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case ReservationActionTypes.STATE_SUCCESS:
    case ReservationActionTypes.RESERVATION_SAVE_SUCCESS: {
      return {
        ...state,
        message: action.payload.message,
        errorMessage: null,
        subErrors: null,
        isLoading: false
      };
    }
    case ReservationActionTypes.RESERVATION_SELECTED: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case ReservationActionTypes.RESERVATION_FAILURE: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case ReservationActionTypes.RESERVATION_SAVE:
    case ReservationActionTypes.RESERVATION_DELETE: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case ReservationActionTypes.CLEAN: {
      return initialState;
    }
    default: {
      return state;
    }
  }
}
