import * as auth from './reducers/auth.reducers';
import * as user from './reducers/user.reducers';
import * as treatment from './reducers/treatment.reducers';
import * as catalogue from './reducers/catalogue.reducers';
import * as room from './reducers/room.reducers';
import * as reservation from './reducers/reservation.reducers';
import * as notification from './reducers/notification.reducers';
import * as unavailable from './reducers/unavailable.reducers';
import * as discount from './reducers/discount.reducers';
import * as main from './reducers/main.reducers';
import * as payment from './reducers/payment.reducers';
import * as dashboard from './reducers/dashboard.reducers';
import * as additional from './reducers/additional.reducers';
import * as currency from './reducers/currency.reducers';
import * as office from './reducers/office.reducers';
import { createFeatureSelector } from '@ngrx/store';

export interface AppState {
  authState: auth.State;
  userState: user.State;
  treatmentState: treatment.State;
  catalogueState: catalogue.State;
  roomState: room.State;
  reservationState: reservation.State;
  notificationState: notification.State;
  unavailableState: unavailable.State;
  discountState: discount.State;
  mainState: main.State;
  paymentState: payment.State;
  dashboardState: dashboard.State;
  additionalState: additional.State;
  currencyState: currency.State;
  officeState: office.State;
}

export const reducers = {
  auth: auth.reducer,
  user: user.reducer,
  treatment: treatment.reducer,
  catalogue: catalogue.reducer,
  room: room.reducer,
  reservation: reservation.reducer,
  notification: notification.reducer,
  unavailable: unavailable.reducer,
  discount: discount.reducer,
  main: main.reducer,
  payment: payment.reducer,
  dashboard: dashboard.reducer,
  additional: additional.reducer,
  currency: currency.reducer,
  office: office.reducer
};

export const selectAuthState = createFeatureSelector<AppState>('auth');
export const selectUserState = createFeatureSelector<AppState>('user');
export const selectTreatmentState = createFeatureSelector<AppState>('treatment');
export const selectCatalogueState = createFeatureSelector<AppState>('catalogue');
export const selectRoomState = createFeatureSelector<AppState>('room');
export const selectReservationState = createFeatureSelector<AppState>('reservation');
export const selectNotificationState = createFeatureSelector<AppState>('notification');
export const selectUnavailableState = createFeatureSelector<AppState>('unavailable');
export const selectDiscountState = createFeatureSelector<AppState>('discount');
export const selectMainState = createFeatureSelector<AppState>('main');
export const selectPaymentState = createFeatureSelector<AppState>('payment');
export const selectDashboardState = createFeatureSelector<AppState>('dashboard');
export const selectAdditionalState = createFeatureSelector<AppState>('additional');
export const selectCurrencyState = createFeatureSelector<AppState>('currency');
export const selectOfficeState = createFeatureSelector<AppState>('office');
