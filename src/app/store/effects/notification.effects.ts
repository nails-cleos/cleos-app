import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsNotification from '../notification.actions';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class NotificationEffects {

  getAll$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsNotification.NotificationActionTypes.getNotificationsPage)).pipe(
      map((action: any) => action.payload),
      switchMap(
        (payload: any) => this.notificationService.getNotificationsPage(payload.active, payload.direction, payload.page,
          payload.size).pipe(
          switchMap((response: any) => of(
            new fromActionsNotification.NotificationSuccess(response ? response : { page: { content: [] } }))),
          catchError(
            (err: HttpErrorResponse) => of(new fromActionsNotification.NotificationFailure({ error: err.error }))),
        )),
    ));

  read$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsNotification.NotificationActionTypes.readNotificationById)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.notificationService.readNotificationById(payload.id).pipe(
        switchMap(() => of(new fromActionsNotification.NotificationReadSuccess(payload))),
        catchError(
          (err: HttpErrorResponse) => of(new fromActionsNotification.NotificationFailure({ error: err.error }))),
      )),
    ));

  delete$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsNotification.NotificationActionTypes.deleteNotificationById)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.notificationService.deleteNotificationById(payload.id).pipe(
        switchMap(() => of(new fromActionsNotification.NotificationDeleteSuccess(payload))),
        catchError(
          (err: HttpErrorResponse) => of(new fromActionsNotification.NotificationFailure({ error: err.error }))),
      )),
    ));

  notificationSubscribe$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsNotification.NotificationActionTypes.subscribeNotification))
    .pipe(map((action: any) => action.payload),
      switchMap((payload: any) => this.notificationService.subscribeNotification(payload).pipe(
        switchMap(() => of(new fromActionsNotification.NotificationSuccess(payload))),
        catchError(
          (err: HttpErrorResponse) => of(new fromActionsNotification.NotificationFailure({ error: err.error }))),
      )),
    ));

  notificationSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsNotification.NotificationActionTypes.notificationSuccess),
  ), { dispatch: false });

  notificationDelete$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsNotification.NotificationActionTypes.notificationDeleteSuccess),
  ), { dispatch: false });

  notificationReadSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsNotification.NotificationActionTypes.notificationReadSuccess),
    tap((data: any) => this.router.navigate([data.payload.navigation])),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions$: Actions,
              private notificationService: NotificationService,
              private router: Router) {
  }
}
