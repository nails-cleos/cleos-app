import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, tap } from 'rxjs/operators';
import {
  deleteNotification,
  getNotificationsPage,
  notificationDeleteSuccess,
  notificationFailure,
  notificationReadSuccess,
  notificationSuccess,
  readNotification,
  subscribeNotification,
} from '../actions/notification.actions';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { Pagination } from '../../interfaces/pagination';
import { INotification } from '../../notification/notification';
import { effectRequest } from '../../util/rxjs';

@Injectable()
export class NotificationEffects {
  private readonly actions: Actions = inject(Actions);
  private readonly notificationService: NotificationService = inject(NotificationService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getNotificationsPage),
    switchMap(({ page, sort, direction, size }) => effectRequest(
      this.notificationService.getNotificationsPage(page, sort, direction, size)
        .pipe(map((data: Pagination<INotification>) =>
          notificationSuccess(
            data ? { data } : {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              data: { page: { content: [] } },
            },
          ))),
      action => action,
      notificationFailure,
    )),
  ));

  read$ = createEffect(() => this.actions.pipe(
    ofType(readNotification),
    switchMap(({ id }) => effectRequest(
      this.notificationService.readNotification(id)
        .pipe(map((data?: INotification) => notificationReadSuccess({ data }))),
      action => action,
      notificationFailure,
    )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteNotification),
    switchMap(({ notification }) => effectRequest(
      this.notificationService.deleteNotification(notification.id)
        .pipe(map(() => notificationDeleteSuccess({ data: notification }))),
      action => action,
      notificationFailure,
    )),
  ));

  notificationSubscribe$ = createEffect(() => this.actions.pipe(
    ofType(subscribeNotification),
    switchMap(({ token }) => effectRequest(
      this.notificationService.subscribeNotification(token).pipe(map(() => notificationSuccess({ data: token }))),
      action => action,
      notificationFailure,
    )),
  ));

  notificationReadSuccess$ = createEffect(() => this.actions.pipe(
    ofType(notificationReadSuccess),
    tap(({ data }) => this.router.navigate([data?.navigation])),
  ), { dispatch: false });
}
