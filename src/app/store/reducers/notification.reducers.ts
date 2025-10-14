import { createReducer, on } from '@ngrx/store';
import {
  clean,
  deleteNotification,
  getNotificationsPage,
  notificationDeleteSuccess,
  notificationFailure,
  notificationReadSuccess,
  notificationSuccess,
  readNotification,
} from '../notification.actions';
import { INotification, INotificationDTO } from '../../interfaces/notification';
import { Pagination } from '../../interfaces/pagination';
import { IError } from '../../interfaces/common';

export interface State {
  data?: INotificationDTO | Pagination<INotification> | string;
  dataDeleted?: INotificationDTO | INotification;
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  dataDeleted: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  isLoading: false,
};

export const notificationReducer = createReducer(
  initialState,
  on(getNotificationsPage, (state): State => ({
    ...state,
    data: { page: { content: [{}, {}, {}] } as Pagination<INotification>, unread: -1 },
    dataDeleted: undefined,
    errorMessage: undefined,
    subErrors: undefined,
  })),
  on(notificationSuccess, (state, { data }): State => ({
    ...state,
    data,
    errorMessage: undefined,
    subErrors: undefined,
  })),
  on(notificationReadSuccess, (state): State => ({
    ...state,
    errorMessage: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(notificationFailure, (state, { error }): State => ({
    ...state,
    errorMessage: error?.message,
    error,
    subErrors: error?.subErrors,
    isLoading: false,
  })),
  on(readNotification, (state): State => ({
    ...state,
    data: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    isLoading: true,
  })),
  on(deleteNotification, (state): State => ({
    ...state,
    dataDeleted: undefined,
    data: undefined,
    errorMessage: undefined,
    subErrors: undefined,
    isLoading: false,
  })),
  on(notificationDeleteSuccess, (state, { data }): State => ({
    ...state,
    dataDeleted: data,
    errorMessage: undefined,
    subErrors: undefined,
  })),
  on(clean, (): State => initialState),
);
