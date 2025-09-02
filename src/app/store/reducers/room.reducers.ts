import { Pagination } from '../../interfaces/pagination';
import { All, RoomActionTypes } from '../room.actions';
import { IRoom, IRoomCustomer, IRoomService } from '../../interfaces/room';
import { IUser } from '../../interfaces/user';
import { ICurrency } from '../../interfaces/currency';

export interface State {
  data: IRoom | Pagination<IRoom> | null;
  services: IRoomService | null;
  professionals: IUser[] | null;
  currencies: ICurrency[] | null;
  offices: IUser[] | null;
  customers: IRoomCustomer[] | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IRoom | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  services: null,
  professionals: null,
  currencies: null,
  offices: null,
  customers: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case RoomActionTypes.getRoomsPage: {
      return {
        ...state,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        data: { content: [{}, {}, {}], totalElements: 3 },
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
      };
    }
    case RoomActionTypes.getAllRoomsInfo: {
      return {
        ...state,
        professionals: null,
        currencies: null,
        offices: null,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
      };
    }
    case RoomActionTypes.findRoomById: {
      return {
        ...state,
        data: {} as IRoom,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
      };
    }
    case RoomActionTypes.findRoomServicesById: {
      return {
        ...state,
        services: {
          currency: {},
          treatments: [],
          selectedTreatments: [],
          additionalList: [],
          selectedAdditionalList: [],
        } as IRoomService,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
      };
    }
    case RoomActionTypes.roomInfoSuccess: {
      return {
        ...state,
        professionals: action.payload.professionals,
        offices: action.payload.offices,
        currencies: action.payload.currencies,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case RoomActionTypes.roomSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case RoomActionTypes.roomSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        errorMessage: null,
        selected: null,
        subErrors: null,
        isLoading: false,
      };
    }
    case RoomActionTypes.roomSelected: {
      return {
        ...state,
        selected: action.payload.roomInfo,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case RoomActionTypes.roomServiceSelected: {
      return {
        ...state,
        services: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case RoomActionTypes.roomFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false,
      };
    }
    case RoomActionTypes.updateRoomServicesById:
    case RoomActionTypes.updateRoomById:
    case RoomActionTypes.createRoom:
    case RoomActionTypes.deleteRoomById: {
      return {
        ...state,
        selected: null,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true,
      };
    }
    case RoomActionTypes.getAllCustomersInfo: {
      return {
        ...state,
        customers: [{}, {}, {}],
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
      };
    }
    case RoomActionTypes.customerInfoSuccess: {
      return {
        ...state,
        customers: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
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
