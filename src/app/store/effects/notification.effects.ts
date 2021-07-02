import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsNotification from '../notification.actions';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class NotificationEffects {

  @Effect()
  getAll$ = this.actions$.pipe(ofType(fromActionsNotification.NotificationActionTypes.notificationPage)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.notificationService.getAll(payload.active, payload.direction, payload.page).pipe(
      switchMap((response: any) => of(new fromActionsNotification.NotificationSuccess(response ? response : {page: {content: []}}))),
      catchError((err: HttpErrorResponse) => of(new fromActionsNotification.NotificationFailure({error: err.error})))
    ))
  );

  @Effect()
  readNotification$ = this.actions$.pipe(ofType(fromActionsNotification.NotificationActionTypes.notificationRead)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.notificationService.readNotification(payload.id).pipe(
      switchMap(() => of(new fromActionsNotification.NotificationReadSuccess(payload))),
      catchError((err: HttpErrorResponse) => of(new fromActionsNotification.NotificationFailure({error: err.error})))
    ))
  );

  @Effect()
  notificationSubscribe$ = this.actions$.pipe(ofType(fromActionsNotification.NotificationActionTypes.notificationSubscribe)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.notificationService.subscribe(payload).pipe(
      switchMap(() => of(new fromActionsNotification.NotificationSuccess(payload))),
      catchError((err: HttpErrorResponse) => of(new fromActionsNotification.NotificationFailure({error: err.error})))
    ))
  );

  @Effect({dispatch: false})
  notificationSuccess$ = this.actions$.pipe(
    ofType(fromActionsNotification.NotificationActionTypes.notificationSuccess)
  );

  @Effect({dispatch: false})
  notificationReadSuccess$ = this.actions$.pipe(
    ofType(fromActionsNotification.NotificationActionTypes.notificationReadSuccess),
    tap((data: any) => this.router.navigate([data.payload.navigation]))
  );

  constructor(private readonly translate: TranslateService, private actions$: Actions, private notificationService: NotificationService,
              private router: Router) {
  }
}
