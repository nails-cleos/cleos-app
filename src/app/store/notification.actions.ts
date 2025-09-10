import { Action } from '@ngrx/store';
import { IError, PageRequest } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';
import { INotification } from '../interfaces/notification';

export enum NotificationActionTypes {
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

export class GetNotificationsPage extends PageRequest implements Action {
  readonly type = NotificationActionTypes.getNotificationsPage;
}

export class NotificationSuccess implements Action {
  readonly type = NotificationActionTypes.notificationSuccess;

  constructor(public data: Pagination<INotification> | string) {
  }
}

export class NotificationFailure implements Action {
  readonly type = NotificationActionTypes.notificationFailure;

  constructor(public error: IError) {
  }
}

export class ReadNotification implements Action {
  readonly type = NotificationActionTypes.readNotification;

  constructor(public id: string) {
  }
}

export class DeleteNotification implements Action {
  readonly type = NotificationActionTypes.deleteNotification;

  constructor(public notification: INotification) {
  }
}

export class NotificationDeleteSuccess implements Action {
  readonly type = NotificationActionTypes.notificationDeleteSuccess;

  constructor(public data: any) {
  }
}

export class SubscribeNotification implements Action {
  readonly type = NotificationActionTypes.subscribeNotification;

  constructor(public token: string) {
  }
}

export class NotificationReadSuccess implements Action {
  readonly type = NotificationActionTypes.notificationReadSuccess;

  constructor(public data?: INotification) {
  }
}

export class Clean implements Action {
  readonly type = NotificationActionTypes.clean;
}

export type All =
  | GetNotificationsPage
  | NotificationSuccess
  | NotificationFailure
  | ReadNotification
  | DeleteNotification
  | NotificationDeleteSuccess
  | NotificationReadSuccess
  | SubscribeNotification
  | Clean;
