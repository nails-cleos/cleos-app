import { createReducer, on } from '@ngrx/store';
import { Pagination } from '../../interfaces/pagination';
import { IUnavailableAll } from '../../interfaces/unavailable';
import { IUserAll } from '../../interfaces/user';
import { IRoomAll } from '../../interfaces/room';
import { IError, IResponseSuccess } from '../../interfaces/common';
import {
  cleanUnavailable,
  createBlockAgenda,
  createUnavailable,
  deleteUnavailable,
  getAllProfessional,
  getAllRoomsByProfessionalId,
  getUnavailable,
  getUnavailablePage,
  professionalSuccess,
  roomSuccess,
  setCurrentUnavailableId,
  setUnavailableParams,
  unavailableFailure,
  unavailableSaveSuccess,
  unavailableSelected,
  unavailableSuccess,
  updateUnavailable,
} from '../unavailable.actions';

export const UNAVAILABLE_FEATURE_KEY = 'unavailable';

export interface UnavailableState {
  response?: IResponseSuccess;
  data?: Pagination<IUnavailableAll>;
  professionals?: IUserAll[];
  rooms?: IRoomAll[];
  error?: IError;
  subErrors?: IError[];
  selected?: IUnavailableAll;
  currentUnavailableId?: string;
  unavailableParams?: { date?: Date; room?: IRoomAll; };
  isLoading: boolean;
}

export const initialState: UnavailableState = {
  data: undefined,
  professionals: undefined,
  rooms: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  currentUnavailableId: undefined,
  unavailableParams: undefined,
  isLoading: false,
};

export const unavailableReducer = createReducer(
  initialState,
  on(getUnavailablePage, (state) => ({
    ...state,
    data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IUnavailableAll>,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllProfessional, (state) => ({
    ...state,
    professionals: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(getAllRoomsByProfessionalId, (state) => ({
    ...state,
    rooms: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(getUnavailable, (state) => ({
    ...state,
    selected: {} as IUnavailableAll,
    subErrors: undefined,
    response: undefined,
  })),
  on(unavailableSuccess, (state, { data }) => ({
    ...state,
    data,
    subErrors: undefined,
    response: undefined,
  })),
  on(professionalSuccess, (state, { professionals }) => ({
    ...state,
    professionals,
    subErrors: undefined,
    response: undefined,
  })),
  on(unavailableSaveSuccess, (state, response) => ({
    ...state,
    response,
    selected: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(unavailableSelected, (state, { selected }) => ({
    ...state,
    selected,
    subErrors: undefined,
    response: undefined,
  })),
  on(unavailableFailure, (state, { error }) => ({
    ...state,
    error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(updateUnavailable, createUnavailable, createBlockAgenda, deleteUnavailable, (state) => ({
    ...state,
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(roomSuccess, (state, { rooms }) => ({
    ...state,
    rooms,
    subErrors: undefined,
    response: undefined,
  })),
  on(setCurrentUnavailableId, (state, { unavailableId }) => ({
    ...state,
    currentUnavailableId: unavailableId,
  })),
  on(setUnavailableParams, (state, { date, room }) => ({
    ...state,
    unavailableParams: { date, room },
  })),
  on(cleanUnavailable, () => initialState),
);
