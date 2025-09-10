import { Pagination } from '../../interfaces/pagination';
import { All, RoomActionTypes } from '../room.actions';
import { IRoom, IRoomCustomer, IRoomService } from '../../interfaces/room';
import { IUser } from '../../interfaces/user';
import { ICurrency } from '../../interfaces/currency';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: IRoom | Pagination<IRoom>;
  services?: IRoomService;
  professionals?: IUser[];
  currencies?: ICurrency[];
  offices?: IUser[];
  customers?: IRoomCustomer[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IRoom;
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  services: undefined,
  professionals: undefined,
  currencies: undefined,
  offices: undefined,
  customers: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case RoomActionTypes.getRoomsPage: {
      return {
        ...state,
        data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IRoom>,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case RoomActionTypes.getAllRoomsInfo: {
      return {
        ...state,
        professionals: undefined,
        currencies: undefined,
        offices: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case RoomActionTypes.getRoom: {
      return {
        ...state,
        data: {} as IRoom,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case RoomActionTypes.getServices: {
      return {
        ...state,
        services: {
          currency: {},
          treatments: [],
          selectedTreatments: [],
          additionalList: [],
          selectedAdditionalList: [],
        } as IRoomService,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case RoomActionTypes.roomInfoSuccess: {
      return {
        ...state,
        professionals: action.roomInfo?.professionals,
        offices: action.roomInfo?.offices,
        currencies: action.roomInfo?.currencies,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case RoomActionTypes.roomSuccess: {
      return {
        ...state,
        data: action.data,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case RoomActionTypes.roomSaveSuccess: {
      return {
        ...state,
        response: action,
        errorMessage: undefined,
        selected: undefined,
        subErrors: undefined,
        isLoading: false,
      };
    }
    case RoomActionTypes.roomSelected: {
      return {
        ...state,
        selected: action.selected,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case RoomActionTypes.roomServiceSelected: {
      return {
        ...state,
        services: action.services,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case RoomActionTypes.roomFailure: {
      return {
        ...state,
        errorMessage: action.error.message,
        error: action.error,
        subErrors: action.error.subErrors,
        response: undefined,
        isLoading: false,
      };
    }
    case RoomActionTypes.updateServices:
    case RoomActionTypes.updateRoom:
    case RoomActionTypes.createRoom:
    case RoomActionTypes.deleteRoom: {
      return {
        ...state,
        selected: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
        isLoading: true,
      };
    }
    case RoomActionTypes.getAllCustomersInfo: {
      return {
        ...state,
        customers: [{}, {}, {}],
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case RoomActionTypes.customerInfoSuccess: {
      return {
        ...state,
        customers: action.customers,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case RoomActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
