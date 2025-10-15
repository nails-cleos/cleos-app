import { createAction, props } from '@ngrx/store';
import { Pagination } from '../interfaces/pagination';
import { IUnavailable } from '../interfaces/unavailable';
import { IError, PageRequest, ResponseSuccess } from '../interfaces/common';
import { IUser } from '../interfaces/user';
import { IRoom } from '../interfaces/room';

enum UnavailableActionTypes {
  getUnavailablePage = '[Unavailable] Get unavailable page',
  unavailableSuccess = '[Unavailable] Success',
  getAllProfessional = '[Unavailable] Get all professional',
  getAllRoomsByProfessionalId = '[Unavailable] Get all rooms by professional id',
  roomSuccess = '[Unavailable] Get room success',
  professionalSuccess = '[Unavailable] Get professional success',
  createUnavailable = '[Unavailable] Create unavailable',
  createBlockAgenda = '[Unavailable] Create block agenda',
  updateUnavailable = '[Unavailable] Update unavailable by id',
  unavailableSaveSuccess = '[Unavailable] Save Success',
  unavailableFailure = '[Unavailable] Failure',
  unavailableSelected = '[Unavailable] Selected',
  getUnavailable = '[Unavailable] Find unavailable by id',
  deleteUnavailable = '[Unavailable] Delete unavailable by id',
  clean = '[Unavailable] Clean'
}

export const getUnavailablePage = createAction(
  UnavailableActionTypes.getUnavailablePage,
  props<PageRequest>(),
);

export const getAllProfessional = createAction(
  UnavailableActionTypes.getAllProfessional,
);

export const getAllRoomsByProfessionalId = createAction(
  UnavailableActionTypes.getAllRoomsByProfessionalId,
  props<{ professionalId: string }>(),
);

export const unavailableSuccess = createAction(
  UnavailableActionTypes.unavailableSuccess,
  props<{ data: Pagination<IUnavailable> }>(),
);

export const roomSuccess = createAction(
  UnavailableActionTypes.roomSuccess,
  props<{ rooms: IRoom[] }>(),
);

export const professionalSuccess = createAction(
  UnavailableActionTypes.professionalSuccess,
  props<{ professionals: IUser[] }>(),
);

export const createUnavailable = createAction(
  UnavailableActionTypes.createUnavailable,
  props<{ unavailable: IUnavailable }>(),
);

export const createBlockAgenda = createAction(
  UnavailableActionTypes.createBlockAgenda,
  props<{ unavailable: IUnavailable }>(),
);

export const updateUnavailable = createAction(
  UnavailableActionTypes.updateUnavailable,
  props<{ id: string; unavailable: IUnavailable; path: string }>(),
);

export const unavailableSaveSuccess = createAction(
  UnavailableActionTypes.unavailableSaveSuccess,
  props<ResponseSuccess>(),
);

export const unavailableFailure = createAction(
  UnavailableActionTypes.unavailableFailure,
  props<{ error: IError }>(),
);

export const unavailableSelected = createAction(
  UnavailableActionTypes.unavailableSelected,
  props<{ selected?: IUnavailable }>(),
);

export const getUnavailable = createAction(
  UnavailableActionTypes.getUnavailable,
  props<{ id: string }>(),
);

export const deleteUnavailable = createAction(
  UnavailableActionTypes.deleteUnavailable,
  props<{ id: string; timestamp: number; timeZone?: string }>(),
);

export const clean = createAction(UnavailableActionTypes.clean);
