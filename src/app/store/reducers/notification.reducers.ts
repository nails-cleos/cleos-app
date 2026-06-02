import { createReducer, on } from '@ngrx/store';
import {
  cleanNotification,
  deleteNotification,
  getNotificationsPage,
  notificationDeleteSuccess,
  notificationFailure,
  notificationReadSuccess,
  notificationSuccess,
  readNotification,
} from '../actions/notification.actions';
import { INotification, INotificationDTO } from '../../interfaces/notification';
import { Pagination } from '../../interfaces/pagination';
import { IError } from '../../interfaces/common';

export const NOTIFICATION_FEATURE_KEY = 'notification';

export interface NotificationState {
  data?: INotificationDTO | Pagination<INotification> | string;
  dataDeleted?: INotification;
  dataRead?: INotification;
  error?: IError;
  subErrors?: IError[];
  isLoading: boolean;
}

export const initialState: NotificationState = {
  data: undefined,
  dataDeleted: undefined,
  dataRead: undefined,
  error: undefined,
  subErrors: undefined,
  isLoading: false,
};

export const notificationReducer = createReducer(
  initialState,
  on(getNotificationsPage, (state): NotificationState => ({
    ...state,
    data: { page: { content: [{}, {}, {}] } as Pagination<INotification>, unread: -1, workDay: [] },
    dataDeleted: undefined,
    dataRead: undefined,
    subErrors: undefined,
  })),
  on(notificationSuccess, (state, { data }): NotificationState => ({
    ...state,
    data,
    subErrors: undefined,
  })),
  on(notificationReadSuccess, (state, { data }): NotificationState => ({
    ...state,
    dataRead: data,
    subErrors: undefined,
    isLoading: false,
  })),
  on(notificationFailure, (state, { error }): NotificationState => ({
    ...state,
    error,
    subErrors: error?.subErrors,
    isLoading: false,
  })),
  on(readNotification, (state): NotificationState => ({
    ...state,
    dataRead: undefined,
    subErrors: undefined,
    isLoading: true,
  })),
  on(deleteNotification, (state): NotificationState => ({
    ...state,
    dataDeleted: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(notificationDeleteSuccess, (state, { data }): NotificationState => ({
    ...state,
    dataDeleted: data,
    subErrors: undefined,
  })),
  on(cleanNotification, (): NotificationState => initialState),
);
