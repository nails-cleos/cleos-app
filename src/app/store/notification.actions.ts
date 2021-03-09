import { Action } from '@ngrx/store';

export enum NotificationActionTypes {
  NOTIFICATION = '[Notification] Get all unread',
  NOTIFICATION_PAGE = '[Notification] Get all paged',
  NOTIFICATION_SUCCESS = '[Notification] Notifications success',
  NOTIFICATION_FAILURE = '[Notification] Failure',
  NOTIFICATION_READ = '[Notification] Notification read',
  NOTIFICATION_READ_SUCCESS = '[Notification] Notification read success',
  CLEAN = '[Notification] Clean'
}

export class GetAllUnread implements Action {
  readonly type = NotificationActionTypes.NOTIFICATION;
}

export class GetAllPaged implements Action {
  readonly type = NotificationActionTypes.NOTIFICATION_PAGE;

  constructor(public payload: any) {
  }
}

export class NotificationSuccess implements Action {
  readonly type = NotificationActionTypes.NOTIFICATION_SUCCESS;

  constructor(public payload: any) {
  }
}

export class NotificationFailure implements Action {
  readonly type = NotificationActionTypes.NOTIFICATION_FAILURE;

  constructor(public payload: any) {
  }
}

export class NotificationRead implements Action {
  readonly type = NotificationActionTypes.NOTIFICATION_READ;

  constructor(public payload: any) {
  }
}

export class NotificationReadSuccess implements Action {
  readonly type = NotificationActionTypes.NOTIFICATION_READ_SUCCESS;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = NotificationActionTypes.CLEAN;
}

export type All =
  | GetAllUnread
  | GetAllPaged
  | NotificationSuccess
  | NotificationFailure
  | NotificationRead
  | NotificationReadSuccess
  | Clean;
