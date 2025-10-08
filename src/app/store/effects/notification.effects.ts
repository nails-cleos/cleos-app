import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  DeleteNotification,
  GetNotificationsPage,
  NotificationActionTypes,
  NotificationDeleteSuccess,
  NotificationFailure,
  NotificationReadSuccess,
  NotificationSuccess,
  ReadNotification,
  SubscribeNotification,
} from '../notification.actions';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { Pagination } from '../../interfaces/pagination';
import { INotification } from '../../interfaces/notification';

@Injectable()
export class NotificationEffects {

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(NotificationActionTypes.getNotificationsPage),
    switchMap((action: GetNotificationsPage) =>
      this.notificationService.getNotificationsPage(action.page, action.sort, action.direction, action.size).pipe(
        switchMap((response: Pagination<INotification>) => of(
          new NotificationSuccess(
            response ? response : { page: { content: [] } } as unknown as Pagination<INotification>))),
        catchError((err: HttpErrorResponse) => of(new NotificationFailure(err.error))),
      )),
  ));

  read$ = createEffect(() => this.actions.pipe(
    ofType(NotificationActionTypes.readNotification),
    switchMap((action: ReadNotification) =>
      this.notificationService.readNotification(action.id).pipe(
        switchMap((notification?: INotification) => of(new NotificationReadSuccess(notification))),
        catchError((err: HttpErrorResponse) => of(new NotificationFailure(err.error))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(NotificationActionTypes.deleteNotification),
    switchMap((action: DeleteNotification) =>
      this.notificationService.deleteNotification(action.notification.id).pipe(
        switchMap(() => of(new NotificationDeleteSuccess(action.notification))),
        catchError((err: HttpErrorResponse) => of(new NotificationFailure(err.error))),
      )),
  ));

  notificationSubscribe$ = createEffect(() => this.actions.pipe(
    ofType(NotificationActionTypes.subscribeNotification),
    switchMap((action: SubscribeNotification) =>
      this.notificationService.subscribeNotification(action.token).pipe(
        switchMap(() => of(new NotificationSuccess(action.token))),
        catchError((err: HttpErrorResponse) => of(new NotificationFailure(err.error))),
      )),
  ));

  notificationSuccess$ = createEffect(() => this.actions.pipe(
    ofType(NotificationActionTypes.notificationSuccess),
  ), { dispatch: false });

  notificationDelete$ = createEffect(() => this.actions.pipe(
    ofType(NotificationActionTypes.notificationDeleteSuccess),
  ), { dispatch: false });

  notificationReadSuccess$ = createEffect(() => this.actions.pipe(
    ofType(NotificationActionTypes.notificationReadSuccess),
    tap((data: NotificationReadSuccess) => this.router.navigate([data.data?.navigation])),
  ), { dispatch: false });

  constructor(private actions: Actions, private notificationService: NotificationService,
              private router: Router) {
  }
}
