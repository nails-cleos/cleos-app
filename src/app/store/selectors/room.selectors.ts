import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IRoom, IRoomAll, IRoomCustomer, IRoomService } from '../../interfaces/room';
import { IError, ResponseSuccess } from '../../interfaces/common';
import { ROOM_FEATURE_KEY, RoomState } from '../reducers/room.reducers';
import { Pagination } from '../../interfaces/pagination';
import { IUserAll } from '../../interfaces/user';
import { ICurrencyAll } from '../../interfaces/currency';
import { IOfficeAll } from '../../interfaces/office';

const selectRoomState = createFeatureSelector<RoomState>(ROOM_FEATURE_KEY);

const selectRoomPaginationData = createSelector(
  selectRoomState,
  (state: RoomState) => state?.data,
);
export const getRoomPaginationPipe = pipe(
  select(selectRoomPaginationData),
  filter((val): val is Pagination<IRoom> => val !== undefined),
);

const selectCurrentRoomId = createSelector(
  selectRoomState,
  (state: RoomState) => state?.currentRoomId,
);
export const getCurrentRoomIdPipe = pipe(
  select(selectCurrentRoomId),
  filter((val): val is string => val !== undefined),
);

const selectedRoom = createSelector(
  selectRoomState,
  (state: RoomState) => state?.selected,
);
export const getSelectedRoomPipe = pipe(
  select(selectedRoom),
  filter((val): val is IRoomAll => val !== undefined),
);

const selectServices = createSelector(
  selectRoomState,
  (state: RoomState) => state?.services,
);
export const getServicesPipe = pipe(
  select(selectServices),
  filter((val): val is IRoomService => val !== undefined),
);

const selectCustomers = createSelector(
  selectRoomState,
  (state: RoomState) => state?.customers,
);
export const getCustomersPipe = pipe(
  select(selectCustomers),
  filter((val): val is IRoomCustomer[] => val !== undefined),
);

const selectProfessionals = createSelector(
  selectRoomState,
  (state: RoomState) => state?.professionals,
);
export const getProfessionalsPipe = pipe(
  select(selectProfessionals),
  filter((val): val is IUserAll[] => val !== undefined),
);

const selectCurrencies = createSelector(
  selectRoomState,
  (state: RoomState) => state?.currencies,
);
export const getCurrenciesPipe = pipe(
  select(selectCurrencies),
  filter((val): val is ICurrencyAll[] => val !== undefined),
);

const selectOffices = createSelector(
  selectRoomState,
  (state: RoomState) => state?.offices,
);
export const getOfficesPipe = pipe(
  select(selectOffices),
  filter((val): val is IOfficeAll[] => val !== undefined),
);

const selectSubErrors = createSelector(
  selectRoomState,
  (state: RoomState) => state?.subErrors,
);
export const getSubErrorsPipe = pipe(
  select(selectSubErrors),
  filter((val): val is IError[] => val !== undefined),
);

const selectRoomResponse = createSelector(
  selectRoomState,
  (state: RoomState) => state?.response,
);
export const getRoomResponsePipe = pipe(
  select(selectRoomResponse),
  filter((val): val is ResponseSuccess => val !== undefined),
);

const selectRoomError = createSelector(
  selectRoomState,
  (state: RoomState) => state?.error,
);
export const getRoomErrorPipe = pipe(
  select(selectRoomError),
  filter((val): val is IError => val !== undefined),
);

const selectRoomIsLoading = createSelector(
  selectRoomState,
  (state: RoomState) => state?.isLoading,
);
export const getRoomIsLoadingPipe = pipe(
  select(selectRoomIsLoading),
  filter((val): val is boolean => val !== undefined),
);
