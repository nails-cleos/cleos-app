import { createReducer, on } from '@ngrx/store';
import { Pagination } from '../../interfaces/pagination';
import { IUnavailable } from '../../interfaces/unavailable';
import { IUser } from '../../interfaces/user';
import { IRoom } from '../../interfaces/room';
import { IError, IResponseSuccess } from '../../interfaces/common';
import {
  clean,
  createBlockAgenda,
  createUnavailable,
  deleteUnavailable,
  getAllProfessional,
  getAllRoomsByProfessionalId,
  getUnavailable,
  getUnavailablePage,
  professionalSuccess,
  roomSuccess,
  unavailableFailure,
  unavailableSaveSuccess,
  unavailableSelected,
  unavailableSuccess,
  updateUnavailable,
} from '../unavailable.actions';

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

export const unavailableReducer = createReducer(
  initialState,
  on(getUnavailablePage, (state) => ({
    ...state,
    data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IUnavailable>,
    errorMessage: undefined,
    subErrors: undefined,
    selected: undefined,
    response: undefined,
  })),
  on(getAllProfessional, (state) => ({
    ...state,
    professionals: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(getAllRoomsByProfessionalId, (state) => ({
    ...state,
    rooms: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(getUnavailable, (state) => ({
    ...state,
    selected: {} as IUnavailable,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(unavailableSuccess, (state, { data }) => ({
    ...state,
    data,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(professionalSuccess, (state, { professionals }) => ({
    ...state,
    professionals,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(unavailableSaveSuccess, (state, response) => ({
    ...state,
    response,
    selected: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(unavailableSelected, (state, { selected }) => ({
    ...state,
    selected,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(unavailableFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(updateUnavailable, createUnavailable, createBlockAgenda, deleteUnavailable, (state) => ({
    ...state,
    error: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(roomSuccess, (state, { rooms }) => ({
    ...state,
    rooms,
    errorMessage: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(clean, () => initialState),
);
