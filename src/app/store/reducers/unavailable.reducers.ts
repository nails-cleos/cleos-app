import { Pagination } from '../../interfaces/pagination';
import { All, UnavailableActionTypes } from '../unavailable.actions';
import { IUnavailable } from '../../interfaces/unavailable';
import { IUser } from '../../interfaces/user';
import { IRoom } from '../../interfaces/room';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: Pagination<IUnavailable>;
  professionals?: IUser[];
  rooms?: IRoom[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IUnavailable;
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  professionals: undefined,
  rooms: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case UnavailableActionTypes.getUnavailablePage: {
      return {
        ...state,
        data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IUnavailable>,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case UnavailableActionTypes.getAllProfessional: {
      return {
        ...state,
        professionals: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case UnavailableActionTypes.getAllRoomsByProfessionalId: {
      return {
        ...state,
        rooms: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case UnavailableActionTypes.getUnavailable: {
      return {
        ...state,
        selected: {} as IUnavailable,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case UnavailableActionTypes.unavailableSuccess: {
      return {
        ...state,
        data: action.data,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case UnavailableActionTypes.professionalSuccess: {
      return {
        ...state,
        professionals: action.professionals,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case UnavailableActionTypes.unavailableSaveSuccess: {
      return {
        ...state,
        response: action,
        selected: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: false,
      };
    }
    case UnavailableActionTypes.unavailableSelected: {
      return {
        ...state,
        selected: action.selected,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case UnavailableActionTypes.unavailableFailure: {
      return {
        ...state,
        errorMessage: action.error.message,
        error: action.error,
        subErrors: action.error.subErrors,
        response: undefined,
        isLoading: false,
      };
    }
    case UnavailableActionTypes.updateUnavailable:
    case UnavailableActionTypes.createUnavailable:
    case UnavailableActionTypes.createBlockAgenda:
    case UnavailableActionTypes.deleteUnavailable: {
      return {
        ...state,
        error: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
        isLoading: true,
      };
    }
    case UnavailableActionTypes.roomSuccess: {
      return {
        ...state,
        rooms: action.rooms,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case UnavailableActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
