import { Pagination } from '../../interfaces/pagination';
import { All, RoomActionTypes } from '../room.actions';
import { IRoom } from '../../interfaces/room';
import { IUser } from '../../interfaces/user';

export interface State {
  data: IRoom | Pagination<IRoom> | null;
  professionals: IUser[] | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IRoom | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  professionals: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case RoomActionTypes.getAll: {
      return {
        ...state,
        // @ts-ignore
        data: {content: [{}, {}, {}], totalElements: 3},
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case RoomActionTypes.getAllProfessional: {
      return {
        ...state,
        professionals: null,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case RoomActionTypes.getMyRoom:
    case RoomActionTypes.roomFind: {
      return {
        ...state,
        // @ts-ignore
        data: {},
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case RoomActionTypes.roomSuccess: {
      return {
        ...state,
        data: action.payload,
        professionals: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case RoomActionTypes.roomSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        errorMessage: null,
        selected: null,
        subErrors: null,
        isLoading: false
      };
    }
    case RoomActionTypes.roomSelected: {
      return {
        ...state,
        selected: action.payload.room,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case RoomActionTypes.roomFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case RoomActionTypes.roomUpdate:
    case RoomActionTypes.roomSave:
    case RoomActionTypes.roomDelete: {
      return {
        ...state,
        selected: null,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
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
