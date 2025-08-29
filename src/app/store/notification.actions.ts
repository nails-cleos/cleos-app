import { Action } from '@ngrx/store';

export enum NotificationActionTypes {
  getNotificationsPage = '[Notification] Get notifications page',
  notificationSuccess = '[Notification] Notifications success',
  notificationFailure = '[Notification] Failure',
  readNotificationById = '[Notification] Read notification by id',
  deleteNotificationById = '[Notification] Delete notification by id',
  notificationDeleteSuccess = '[Notification] Notifications delete success',
  notificationReadSuccess = '[Notification] Notification read success',
  subscribeNotification = '[Notification] Subscribe notification',
  clean = '[Notification] Clean'
}

export class GetNotificationsPage implements Action {
  readonly type = NotificationActionTypes.getNotificationsPage;

  constructor(public payload: any) {
  }
}

export class NotificationSuccess implements Action {
  readonly type = NotificationActionTypes.notificationSuccess;

  constructor(public payload: any) {
  }
}

export class NotificationFailure implements Action {
  readonly type = NotificationActionTypes.notificationFailure;

  constructor(public payload: any) {
  }
}

export class ReadNotificationById implements Action {
  readonly type = NotificationActionTypes.readNotificationById;

  constructor(public payload: any) {
  }
}

export class DeleteNotificationById implements Action {
  readonly type = NotificationActionTypes.deleteNotificationById;

  constructor(public payload: any) {
  }
}

export class NotificationDeleteSuccess implements Action {
  readonly type = NotificationActionTypes.notificationDeleteSuccess;

  constructor(public payload: any) {
  }
}

export class SubscribeNotification implements Action {
  readonly type = NotificationActionTypes.subscribeNotification;

  constructor(public payload: any) {
  }
}

export class NotificationReadSuccess implements Action {
  readonly type = NotificationActionTypes.notificationReadSuccess;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = NotificationActionTypes.clean;
}

export type All =
  | GetNotificationsPage
  | NotificationSuccess
  | NotificationFailure
  | ReadNotificationById
  | DeleteNotificationById
  | NotificationDeleteSuccess
  | NotificationReadSuccess
  | SubscribeNotification
  | Clean;
