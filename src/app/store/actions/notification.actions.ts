import { createAction, props } from '@ngrx/store';
import { IError, PageRequest } from '../../interfaces/common';
import { Pagination } from '../../interfaces/pagination';
import { INotification } from '../../interfaces/notification';

enum NotificationActionTypes {
  getNotificationsPage = '[Notification] Get notifications page',
  notificationSuccess = '[Notification] Notifications success',
  notificationFailure = '[Notification] Failure',
  readNotification = '[Notification] Read notification by id',
  deleteNotification = '[Notification] Delete notification by id',
  notificationDeleteSuccess = '[Notification] Notifications delete success',
  notificationReadSuccess = '[Notification] Notification read success',
  subscribeNotification = '[Notification] Subscribe notification',
  clean = '[Notification] Clean'
}

export const getNotificationsPage = createAction(
  NotificationActionTypes.getNotificationsPage,
  props<PageRequest>(),
);

export const notificationSuccess = createAction(
  NotificationActionTypes.notificationSuccess,
  props<{ data: Pagination<INotification> | string }>(),
);

export const notificationFailure = createAction(
  NotificationActionTypes.notificationFailure,
  props<{ error: IError }>(),
);

export const readNotification = createAction(
  NotificationActionTypes.readNotification,
  props<{ id: string }>(),
);

export const deleteNotification = createAction(
  NotificationActionTypes.deleteNotification,
  props<{ notification: INotification }>(),
);

export const notificationDeleteSuccess = createAction(
  NotificationActionTypes.notificationDeleteSuccess,
  props<{ data: INotification }>(),
);

export const notificationReadSuccess = createAction(
  NotificationActionTypes.notificationReadSuccess,
  props<{ data?: INotification }>(),
);

export const subscribeNotification = createAction(
  NotificationActionTypes.subscribeNotification,
  props<{ token: string }>(),
);

export const cleanNotification = createAction(NotificationActionTypes.clean);
