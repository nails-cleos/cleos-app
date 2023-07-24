import { Pagination } from '../../interfaces/pagination';
import { All, UnavailableActionTypes } from '../unavailable.actions';
import { IUnavailable } from '../../interfaces/unavailable';
import { IUser } from '../../interfaces/user';
import { IRoom } from '../../interfaces/room';

export interface State {
  data: IUnavailable | Pagination<IUnavailable> | null;
  professionals: IUser[] | null;
  room: IRoom | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IUnavailable | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  professionals: null,
  room: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case UnavailableActionTypes.getAll: {
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
    case UnavailableActionTypes.getAllProfessional: {
      return {
        ...state,
        professionals: null,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case UnavailableActionTypes.getRoom: {
      return {
        ...state,
        room: null,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case UnavailableActionTypes.unavailableFind: {
      return {
        ...state,
        data: {} as IUnavailable,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case UnavailableActionTypes.unavailableSuccess: {
      return {
        ...state,
        data: action.payload,
        professionals: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case UnavailableActionTypes.unavailableSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        selected: null,
        errorMessage: null,
        subErrors: null,
        isLoading: false
      };
    }
    case UnavailableActionTypes.unavailableSelected: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case UnavailableActionTypes.unavailableFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case UnavailableActionTypes.unavailableUpdate:
    case UnavailableActionTypes.unavailableSave:
    case UnavailableActionTypes.unavailableBlockAgenda:
    case UnavailableActionTypes.unavailableDelete: {
      return {
        ...state,
        error: null,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case UnavailableActionTypes.roomSuccess: {
      return {
        ...state,
        room: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
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
