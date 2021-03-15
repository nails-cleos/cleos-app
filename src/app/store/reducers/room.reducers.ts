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

export function reducer(state = initialState, action: All): State {
  switch (action.type) {
    case RoomActionTypes.GET_ALL: {
      return {
        ...state,
        // @ts-ignore
        data: {content: [{}, {}, {}], totalElements: 3},
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case RoomActionTypes.GET_ALL_PROFESSIONAL: {
      return {
        ...state,
        professionals: null,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case RoomActionTypes.GET_MY_ROOM:
    case RoomActionTypes.ROOM_FIND: {
      return {
        ...state,
        // @ts-ignore
        data: {},
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case RoomActionTypes.ROOM_SUCCESS: {
      return {
        ...state,
        data: action.payload,
        professionals: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case RoomActionTypes.ROOM_SAVE_SUCCESS: {
      return {
        ...state,
        message: action.payload.message,
        errorMessage: null,
        subErrors: null,
        isLoading: false
      };
    }
    case RoomActionTypes.ROOM_SELECTED: {
      return {
        ...state,
        selected: action.payload.room,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case RoomActionTypes.ROOM_FAILURE: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case RoomActionTypes.ROOM_UPDATE:
    case RoomActionTypes.ROOM_SAVE:
    case RoomActionTypes.ROOM_DELETE: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case RoomActionTypes.CLEAN: {
      return initialState;
    }
    default: {
      return state;
    }
  }
}
