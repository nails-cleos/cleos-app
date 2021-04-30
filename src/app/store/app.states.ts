import * as auth from './reducers/auth.reducers';
import * as user from './reducers/user.reducers';
import * as product from './reducers/product.reducers';
import * as catalogue from './reducers/catalogue.reducers';
import * as room from './reducers/room.reducers';
import * as reservation from './reducers/reservation.reducers';
import * as notification from './reducers/notification.reducers';
import * as unavailable from './reducers/unavailable.reducers';
import { createFeatureSelector } from '@ngrx/store';

export interface AppState {
  authState: auth.State;
  userState: user.State;
  productState: product.State;
  catalogueState: catalogue.State;
  roomState: room.State;
  reservationState: reservation.State;
  notificationState: notification.State;
  unavailableState: unavailable.State;
}

export const reducers = {
  auth: auth.reducer,
  user: user.reducer,
  product: product.reducer,
  catalogue: catalogue.reducer,
  room: room.reducer,
  reservation: reservation.reducer,
  notification: notification.reducer,
  unavailable: unavailable.reducer
};

export const selectAuthState = createFeatureSelector<AppState>('auth');
export const selectUserState = createFeatureSelector<AppState>('user');
export const selectProductState = createFeatureSelector<AppState>('product');
export const selectCatalogueState = createFeatureSelector<AppState>('catalogue');
export const selectRoomState = createFeatureSelector<AppState>('room');
export const selectReservationState = createFeatureSelector<AppState>('reservation');
export const selectNotificationState = createFeatureSelector<AppState>('notification');
export const selectUnavailableState = createFeatureSelector<AppState>('unavailable');
