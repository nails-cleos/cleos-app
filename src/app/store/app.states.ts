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
import * as invoice from './reducers/invoice.reducers';
import * as color from './reducers/color.reducers';
import * as expense from './reducers/expense.reducers';
import * as note from './reducers/note.reducers';
import * as account from './reducers/account.reducers';
import * as i18n from './reducers/i18n.reducers';
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
  invoiceState: invoice.State;
  colorState: color.State;
  expenseState: expense.State;
  noteState: note.State;
  accountState: account.State;
  i18nState: i18n.State;
}

export const reducers = {
  auth: auth.authReducer,
  user: user.userReducer,
  treatment: treatment.treatmentReducer,
  catalogue: catalogue.catalogueReducer,
  room: room.roomReducer,
  reservation: reservation.reservationReducer,
  notification: notification.notificationReducer,
  unavailable: unavailable.unavailableReducer,
  discount: discount.discountReducer,
  main: main.mainReducer,
  payment: payment.paymentReducer,
  dashboard: dashboard.dashboardReducer,
  additional: additional.additionalReducer,
  currency: currency.currencyReducer,
  office: office.officeReducer,
  invoice: invoice.invoiceReducer,
  color: color.colorReducer,
  expense: expense.expenseReducer,
  note: note.noteReducer,
  account: account.accountReducer,
  i18n: i18n.i18nReducer,
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
export const selectInvoiceState = createFeatureSelector<AppState>('invoice');
export const selectColorState = createFeatureSelector<AppState>('color');
export const selectExpenseState = createFeatureSelector<AppState>('expense');
export const selectNoteState = createFeatureSelector<AppState>('note');
export const selectAccountState = createFeatureSelector<AppState>('account');
export const selectI18nState = createFeatureSelector<AppState>('i18n');
