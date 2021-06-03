import { Action } from '@ngrx/store';

export enum NotificationActionTypes {
  notificationPage = '[Notification] Get all paged',
  notificationSuccess = '[Notification] Notifications success',
  notificationFailure = '[Notification] Failure',
  notificationRead = '[Notification] Notification read',
  notificationReadSuccess = '[Notification] Notification read success',
  notificationSubscribe = '[Notification] Notification subscribe',
  clean = '[Notification] Clean'
}

export class GetAllPaged implements Action {
  readonly type = NotificationActionTypes.notificationPage;

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

export class NotificationRead implements Action {
  readonly type = NotificationActionTypes.notificationRead;

  constructor(public payload: any) {
  }
}

export class NotificationSubscribe implements Action {
  readonly type = NotificationActionTypes.notificationSubscribe;

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
  | GetAllPaged
  | NotificationSuccess
  | NotificationFailure
  | NotificationRead
  | NotificationReadSuccess
  | NotificationSubscribe
  | Clean;
