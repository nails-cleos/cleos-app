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

  getAll$ = createEffect(() => this.actions$.pipe(ofType(fromActionsNotification.NotificationActionTypes.notificationPage)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.notificationService.getAll(payload.active, payload.direction, payload.page).pipe(
      switchMap((response: any) => of(new fromActionsNotification.NotificationSuccess(response ? response : {page: {content: []}}))),
      catchError((err: HttpErrorResponse) => of(new fromActionsNotification.NotificationFailure({error: err.error})))
    ))
  ));

  readNotification$ = createEffect(() => this.actions$.pipe(ofType(fromActionsNotification.NotificationActionTypes.notificationRead)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.notificationService.readNotification(payload.id).pipe(
      switchMap(() => of(new fromActionsNotification.NotificationReadSuccess(payload))),
      catchError((err: HttpErrorResponse) => of(new fromActionsNotification.NotificationFailure({error: err.error})))
    ))
  ));

  notificationSubscribe$ = createEffect(() => this.actions$.pipe(ofType(fromActionsNotification.NotificationActionTypes.notificationSubscribe)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.notificationService.subscribe(payload).pipe(
      switchMap(() => of(new fromActionsNotification.NotificationSuccess(payload))),
      catchError((err: HttpErrorResponse) => of(new fromActionsNotification.NotificationFailure({error: err.error})))
    ))
  ));

  notificationSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsNotification.NotificationActionTypes.notificationSuccess)
  ), {dispatch: false});

  notificationReadSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsNotification.NotificationActionTypes.notificationReadSuccess),
    tap((data: any) => this.router.navigate([data.payload.navigation]))
  ), {dispatch: false});

  constructor(private readonly translate: TranslateService, private actions$: Actions, private notificationService: NotificationService,
              private router: Router) {
  }
}
