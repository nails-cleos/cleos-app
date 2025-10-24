import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  deleteNotification,
  getNotificationsPage,
  notificationDeleteSuccess,
  notificationFailure,
  notificationReadSuccess,
  notificationSuccess,
  readNotification,
  subscribeNotification,
} from '../notification.actions';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { Pagination } from '../../interfaces/pagination';
import { INotification } from '../../interfaces/notification';

@Injectable()
export class NotificationEffects {
  private readonly actions: Actions = inject(Actions);
  private readonly notificationService: NotificationService = inject(NotificationService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getNotificationsPage),
    switchMap(({ page, sort, direction, size }) =>
      this.notificationService.getNotificationsPage(page, sort, direction, size).pipe(
        map((data: Pagination<INotification>) =>
          notificationSuccess(
            data ? { data } : {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              data: { page: { content: [] } },
            },
          )),
        catchError((err: HttpErrorResponse) => of(notificationFailure({ error: err.error }))),
      )),
  ));

  read$ = createEffect(() => this.actions.pipe(
    ofType(readNotification),
    switchMap(({ id }) =>
      this.notificationService.readNotification(id).pipe(
        map((data?: INotification) => notificationReadSuccess({ data })),
        catchError((err: HttpErrorResponse) => of(notificationFailure({ error: err.error }))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteNotification),
    switchMap(({ notification }) =>
      this.notificationService.deleteNotification(notification.id).pipe(
        map(() => notificationDeleteSuccess({ data: notification })),
        catchError((err: HttpErrorResponse) => of(notificationFailure({ error: err.error }))),
      )),
  ));

  notificationSubscribe$ = createEffect(() => this.actions.pipe(
    ofType(subscribeNotification),
    switchMap(({ token }) =>
      this.notificationService.subscribeNotification(token).pipe(
        map(() => notificationSuccess({ data: token })),
        catchError((err: HttpErrorResponse) => of(notificationFailure({ error: err.error }))),
      )),
  ));

  notificationSuccess$ = createEffect(() => this.actions.pipe(
    ofType(notificationSuccess),
  ), { dispatch: false });

  notificationDelete$ = createEffect(() => this.actions.pipe(
    ofType(notificationDeleteSuccess),
  ), { dispatch: false });

  notificationReadSuccess$ = createEffect(() => this.actions.pipe(
    ofType(notificationReadSuccess),
    tap(({ data }) => this.router.navigate([data?.navigation])),
  ), { dispatch: false });
}
